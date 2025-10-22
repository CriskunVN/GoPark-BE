import User, {} from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { addPasswordResetJob, addVerifyEmailJob, } from '../queues/passwordReset.queue.js';
import { limitResetRequest } from '../utils/rateLimit.js';
// Hàm tạo token JWT
// Hàm này sẽ tạo một token JWT với id người dùng và bí mật từ biến môi trường
// Token sẽ hết hạn sau thời gian được định nghĩa trong biến môi trường JWT_EXPIRES_IN
const signAccessToken = (id) => {
    const expiresIn = '15m';
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    });
};
const signRefreshToken = (id) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    return jwt.sign({ id: id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });
};
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
        createSendToken(user, 201, res);
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
    // send token to client
    createSendToken(user, 200, res, req.body.rememberMe);
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
        // 4. Log the user in, send JWT
        createSendToken(user, 200, res);
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
    // 3. Log user in, send JWT
    createSendToken(user, 200, res);
});
// function để tạo và gửi token JWT cho client
const createSendToken = async (user, statusCode, res, rememberMe = false) => {
    const uid = typeof user._id === 'string' ? user._id : user._id;
    const accessToken = signAccessToken(uid);
    const refreshToken = signRefreshToken(uid);
    if (rememberMe === true) {
        const days = Number(process.env.JWT_COOKIE_EXPIRES_IN ?? '7d');
        const cookieOptions = {
            httpOnly: true,
            sameSite: 'strict',
            expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
            path: '/', // để clear cookie đúng sau này
        };
        if (process.env.NODE_ENV === 'production')
            cookieOptions.secure = true;
        res.cookie('refreshToken', refreshToken, cookieOptions);
    }
    else {
        // Nếu không rememberMe, đảm bảo xóa cookie cũ (nếu có)
        res.clearCookie('refreshToken', { path: '/' });
    }
    // Trả user không bao gồm password để tránh lỗi TS và lộ thông tin
    const userPublic = await User.findById(uid)
        .select('-password -passwordResetToken -passwordResetExpires')
        .lean();
    return res.status(statusCode).json({
        status: 'success',
        token: accessToken,
        data: {
            user: userPublic,
        },
    });
};
// Hàm làm mới token JWT sử dụng refresh token
export const refreshToken = catchAsync(async (req, res, next) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) {
        return next(new AppError('No refresh token provided', 401));
    }
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    }
    catch (err) {
        return next(new AppError('Invalid or expired refresh token', 401));
    }
    const user = await User.findById(decoded.id).select('+isActive');
    if (!user) {
        return next(new AppError('User not found', 401));
    }
    const accessToken = signAccessToken(user._id);
    res.status(200).json({
        status: 'success',
        token: accessToken,
        data: {
            user,
        },
    });
});
//# sourceMappingURL=auth.controller.js.map