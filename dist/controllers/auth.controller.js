import User, {} from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { REFRESH_TOKEN_EXPIRES_DAYS } from '../types/typeToken.js';
import { addPasswordResetJob, addVerifyEmailJob, } from '../queues/passwordReset.queue.js';
import { limitResetRequest } from '../utils/rateLimit.js';
// import utils tạo access token và refresh token
import * as createToken from '../utils/createToken.js';
import Session from '../models/session.model.js';
// Hàm đăng ký người dùng mới
export const signup = catchAsync(async (req, res, next) => {
    const { userName, email, password, passwordConfirm, profilePicture, phoneNumber, } = req.body;
    // Kiểm tra nếu tài khoản đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Người dùng đã tồn tại với email này', 409));
    }
    if (password.length < 8) {
        return next(new AppError('Mật khẩu phải có ít nhất 8 ký tự', 400));
    }
    try {
        // Tạo khách hàng mới
        const user = await User.create({
            userName,
            email,
            password,
            passwordConfirm,
            profilePicture,
            phoneNumber,
        });
        // Gửi email chào mừng người dùng mới và xác nhận email
        // await sendWelcomeEmail(user.email, user.userName);
        // Tạo token xác nhận email (có thể dùng JWT hoặc random string)
        const verifyToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        console.log(`Verify Token: ${verifyToken}`);
        // Gửi email xác nhận
        await addVerifyEmailJob(user.email, verifyToken);
        // Tạo token và set cookie
        // createSendToken(user, 201, res);
        res.status(201).json({
            status: 'success',
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.',
        });
    }
    catch (err) {
        // Custom lại message cho lỗi passwordConfirm
        if (err.name === 'ValidationError' &&
            err.errors &&
            err.errors.passwordConfirm) {
            return next(new AppError('Mật khẩu xác nhận không khớp với mật khẩu!', 400));
        }
        return next(err);
    }
});
export const verifyEmail = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    if (!token) {
        return next(new AppError('Token xác nhận không được để trống!', 400));
    }
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (err) {
        return next(new AppError('Token xác nhận không hợp lệ hoặc đã hết hạn!', 400));
    }
    const user = await User.findById(decoded.id);
    if (!user)
        return next(new AppError('Người dùng không tồn tại!', 404));
    user.isActive = true;
    await user.save({ validateBeforeSave: false });
    res
        .status(200)
        .json({ status: 'success', message: 'Xác nhận email thành công!' });
});
// Hàm đăng nhập người dùng
export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // kiểm tra nếu email và password được cung cấp
    if (!email || !password) {
        return next(new AppError('Vui lòng cung cấp email và mật khẩu!', 400));
    }
    // kiểm tra xem người dùng có tồn tại trong cơ sở dữ liệu hay không
    const user = await User.findOne({ email }).select('+password +isActive');
    // correctPassword là một phương thức trong mô hình người dùng để so sánh mật khẩu đã nhập với mật khẩu đã mã hóa trong cơ sở dữ liệu
    // nếu mật khẩu không đúng, trả về lỗi
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Email hoặc mật khẩu không đúng', 401));
    }
    if (!user.isActive) {
        return next(new AppError('Vui lòng xác nhận email trước khi đăng nhập', 401));
    }
    // tạo token và gửi về cho client
    const { accessToken, refreshToken } = createToken.createTokens(user._id);
    // lưu refresh token vào cơ sở dữ liệu
    await Session.create({
        userId: user._id,
        refreshToken: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS),
    });
    // Cập nhật refresh token trong cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // chống XSS
        secure: true,
        sameSite: 'strict', // Chỉ gửi cookie trong cùng một trang web
        maxAge: REFRESH_TOKEN_EXPIRES_DAYS, // 30 days
    });
    // Trả về access token và thông tin người dùng (không bao gồm mật khẩu)
    user.password = undefined;
    res.status(200).json({
        status: 'success',
        token: accessToken,
        data: {
            user,
        },
    });
});
// Hàm này đươc sử dụng để lấy lại mật khẩu của người dùng
// Nó sẽ gửi một email chứa token để người dùng có thể đặt lại mật khẩu của mình
// Token này sẽ được lưu trong cơ sở dữ liệu và có thời gian hết hạn
export const forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    try {
        // 1. Lấy user dựa trên email được cung cấp trong request body
        if (!user) {
            return next(new AppError('Không có người dùng nào với email này', 404));
        }
        // 2. Tạo random reset token để đặt lại mật khẩu
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });
        // 3. Gửi token đến email của người dùng
        // limit request đặt lại mật khẩu: 3 lần/phút
        await limitResetRequest(user.email, req.ip, 3, 60); // 3 lần/phút
        // Sử dụng job queue để gửi email
        await addPasswordResetJob(user.email, resetToken);
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    }
    catch (err) {
        // nếu có lỗi xảy ra trong quá trình gửi email, chúng ta sẽ xóa token và thời gian hết hạn khỏi cơ sở dữ liệu
        if (user) {
            user.passwordResetToken = '';
            user.passwordResetExpires = new Date(0);
            await user.save({ validateBeforeSave: false });
        }
        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
};
// Đây là hàm để đặt lại mật khẩu của người dùng
export const resetPassword = catchAsync(async (req, res, next) => {
    // 1. Lấy token từ URL và kiểm tra xem token có hợp lệ hay không
    // hash token từ URL để so sánh với token đã được lưu trong cơ sở dữ liệu
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    // tìm kiếm người dùng dựa trên token đã được hash và thời gian hết hạn
    // passwordResetExpires là thời gian hết hạn của token, nếu token đã hết hạn thì sẽ không tìm thấy người dùng
    // $gt: Date.now() nghĩa là token phải còn hiệu lực (chưa hết hạn)
    console.log(`Hashed Token: ${hashedToken}`);
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    // 2. Kiểm tra xem người dùng có tồn tại hay không
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    if (req.body.password.length < 8) {
        return next(new AppError('Mật khẩu phải có ít nhất 8 ký tự', 400));
    }
    // không lỗi thì sẽ tiếp tục cập nhật mật khẩu
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = '';
    user.passwordResetExpires = new Date(0);
    try {
        await user.save();
        // 3. cập nhật thời gian thay đổi mật khẩu
        // pre save middleware trong mô hình người dùng sẽ tự động cập nhật thời gian thay đổi mật khẩu
        // 4. Log the user in
        user.password = undefined;
        res.status(200).json({
            status: 'success',
            message: 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại.',
            data: {
                user,
            },
        });
    }
    catch (err) {
        {
            if (err.name === 'ValidationError' &&
                err.errors &&
                err.errors.passwordConfirm) {
                return next(new AppError('Mật khẩu xác nhận không khớp với mật khẩu!', 400));
            }
        }
    }
});
// Hàm này được sử dụng để cập nhật mật khẩu của người dùng đã đăng nhập
export const updatePassword = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.id) {
        return next(new AppError('Không có thông tin người dùng', 401));
    }
    const user = await User.findById(req.user.id).select('+password'); // select('+password') để lấy mật khẩu đã mã hóa của người dùng
    if (!user) {
        return next(new AppError('Người dùng không tồn tại', 404));
    }
    // 1. Kiểm tra mật khẩu nhập có đúng với mật khẩu trong DB không
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }
    // 2. Nếu đúng, cập nhật mật khẩu mới
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    user.password = undefined;
    // 3. Log user in, send JWT
    // tạo token
    const accessToken = createToken.createToken(String(user._id));
    res.status(200).json({
        status: 'success',
        message: 'Mật khẩu đã được cập nhật thành công',
        token: accessToken,
    });
});
export const refreshToken = catchAsync(async (req, res, next) => {
    // Lấy refresh token từ cookie
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return next(new AppError('Refresh token not provided', 403));
    }
    // Kiểm tra refresh token trong database
    const session = await Session.findOne({ refreshToken });
    if (!session) {
        return next(new AppError('Invalid refresh token or expired', 403));
    }
    // kiểm tra hết hạn chưa
    const expiresAt = session.expiresAt;
    if (!expiresAt || expiresAt < new Date()) {
        return next(new AppError('Refresh token expired', 403));
    }
    // Tạo access token mới - lấy userId từ session
    const userId = session.userId;
    if (!userId) {
        return next(new AppError('Associated user not found for session', 403));
    }
    const accessToken = createToken.createToken(String(userId));
    res.status(200).json({
        status: 'success',
        message: 'Tạo mới AccessToken thành công',
        token: accessToken,
    });
});
//# sourceMappingURL=auth.controller.js.map