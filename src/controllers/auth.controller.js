import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../services/email.service.js';

// Hàm tạo token JWT
// Hàm này sẽ tạo một token JWT với id người dùng và bí mật từ biến môi trường
// Token sẽ hết hạn sau thời gian được định nghĩa trong biến môi trường JWT_EXPIRES_IN
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Hàm đăng ký người dùng mới
export const signup = catchAsync(async (req, res, next) => {
  const {
    userName,
    email,
    password,
    passwordConfirm,
    profilePicture,
    phoneNumber,
  } = req.body;

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

    // Tạo token và set cookie
    createSendToken(user, 201, res);
  } catch (err) {
    // Custom lại message cho lỗi passwordConfirm
    if (
      err.name === 'ValidationError' &&
      err.errors &&
      err.errors.passwordConfirm
    ) {
      return next(
        new AppError('Mật khẩu xác nhận không khớp với mật khẩu!', 400)
      );
    }
    return next(err);
  }
});

// Hàm đăng nhập người dùng
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // kiểm tra nếu email và password được cung cấp
  if (!email || !password) {
    return next(new AppError('Vui lòng cung cấp email và mật khẩu!', 400));
  }
  // kiểm tra xem người dùng có tồn tại trong cơ sở dữ liệu hay không
  const user = await User.findOne({ email }).select('+password');

  // correctPassword là một phương thức trong mô hình người dùng để so sánh mật khẩu đã nhập với mật khẩu đã mã hóa trong cơ sở dữ liệu
  // nếu mật khẩu không đúng, trả về lỗi
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email hoặc mật khẩu không đúng', 401));
  }

  // send token to client
  createSendToken(user, 200, res);
});

// Đây là hàm bảo vệ các route yêu cầu người dùng đã đăng nhập
// Nó sẽ kiểm tra xem người dùng đã đăng nhập hay chưa bằng cách kiểm tra token trong header của request
// Nếu token hợp lệ, nó sẽ lấy thông tin người dùng từ cơ sở dữ liệu và gán vào req.user
export const protect = catchAsync(async (req, res, next) => {
  // 1. lấy token từ header của request
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError(
        'Bạn chưa đăng nhập! Vui lòng đăng nhập để có quyền truy cập.',
        401
      )
    );
  }
  // 2. Xác thực token
  // Sử dụng promisify để chuyển đổi jwt.verify thành một hàm trả về Promise
  // Điều này cho phép chúng ta sử dụng await để đợi kết quả xác thực token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Kiểm tra xem người dùng còn tồn tại hay không
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('Người dùng thuộc về token này không còn tồn tại', 401)
    );
  }

  //4. Kiểm tra xem người dùng đã thay đổi mật khẩu sau khi token được tạo hay không
  // Nếu người dùng đã thay đổi mật khẩu, token sẽ không còn hợp lệ nữa
  // Chúng ta sẽ so sánh thời gian thay đổi mật khẩu với thời gian tạo token (decoded.iat)
  // decoded.iat là thời gian tạo token được lưu trong payload của token
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Người dùng đã thay đổi mật khẩu gần đây! Vui lòng đăng nhập lại.',
        401
      )
    );
  }

  // 5. Nếu tất cả các bước trên đều thành công, gán người dùng vào req.user
  req.user = currentUser;
  next();
});

// Hàm này được sử dụng để giới hạn quyền truy cập vào các route chỉ cho phép người dùng có vai trò nhất định
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'user']. if role='parking_owner' no have permission
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Bạn không có quyền thực hiện hành động này', 403)
      );
    }
    next();
  };
};

// Hàm này đươc sử dụng để lấy lại mật khẩu của người dùng
// Nó sẽ gửi một email chứa token để người dùng có thể đặt lại mật khẩu của mình
// Token này sẽ được lưu trong cơ sở dữ liệu và có thời gian hết hạn
export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Lấy user dựa trên email được cung cấp trong request body
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Không có người dùng nào với email này', 404));
  }
  // 2. Tạo random reset token để đặt lại mật khẩu
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Gửi reset token qua email
  const resetURL = `${process.env.URL_FE}/account/reset/password?token=${resetToken}`;

  const message = `Quên mật khẩu? Gửi yêu cầu PATCH với mật khẩu mới và mật khẩu xác thực đến: ${resetURL}.
                    Nếu bạn không quên mật khẩu, vui lòng bỏ qua email này!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
      user: user.userName,
      resetURL, // truyền resetURL vào đây nếu cần
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    // nếu có lỗi xảy ra trong quá trình gửi email, chúng ta sẽ xóa token và thời gian hết hạn khỏi cơ sở dữ liệu
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

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
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  try {
    await user.save();

    // 3. cập nhật thời gian thay đổi mật khẩu
    // pre save middleware trong mô hình người dùng sẽ tự động cập nhật thời gian thay đổi mật khẩu

    // 4. Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    if (
      err.name === 'ValidationError' &&
      err.errors &&
      err.errors.passwordConfirm
    ) {
      return next(
        new AppError('Mật khẩu xác nhận không khớp với mật khẩu!', 400)
      );
    }
  }
});

// Hàm này được sử dụng để cập nhật mật khẩu của người dùng đã đăng nhập
export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password'); // select('+password') để lấy mật khẩu đã mã hóa của người dùng

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
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // create cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  // check run at environment proc or dev
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // remove password in response to client
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
