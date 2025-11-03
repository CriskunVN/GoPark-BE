import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
// Đây là hàm bảo vệ các route yêu cầu người dùng đã đăng nhập
// Nó sẽ kiểm tra xem người dùng đã đăng nhập hay chưa bằng cách kiểm tra token trong header của request
// Nếu token hợp lệ, nó sẽ lấy thông tin người dùng từ cơ sở dữ liệu và gán vào req.user
export const protect = catchAsync(async (req, res, next) => {
    // 1. lấy token từ header của request
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('Bạn chưa đăng nhập! Vui lòng đăng nhập để có quyền truy cập.', 401));
    }
    // 2. Xác thực token
    // Sử dụng jwt.verify với Promise để có thể await
    const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err)
                return reject(new AppError('Token không hợp lệ hoặc đã hết hạn', 403));
            resolve(decoded);
        });
    });
    // 3. Kiểm tra xem người dùng còn tồn tại hay không
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('Người dùng thuộc về token này không còn tồn tại', 401));
    }
    //4. Kiểm tra xem người dùng đã thay đổi mật khẩu sau khi token được tạo hay không
    // Nếu người dùng đã thay đổi mật khẩu, token sẽ không còn hợp lệ nữa
    // Chúng ta sẽ so sánh thời gian thay đổi mật khẩu với thời gian tạo token (decoded.iat)
    // decoded.iat là thời gian tạo token được lưu trong payload của token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Người dùng đã thay đổi mật khẩu gần đây! Vui lòng đăng nhập lại.', 401));
    }
    // 5. Nếu tất cả các bước trên đều thành công, gán người dùng vào req.user
    req.user = currentUser;
    next();
});
// Hàm này được sử dụng để giới hạn quyền truy cập vào các route chỉ cho phép người dùng có vai trò nhất định
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // vd: roles ['admin', 'user']. if role='parking_owner' no have permission
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('Bạn không có quyền thực hiện hành động này', 403));
        }
        next();
    };
};
//# sourceMappingURL=auth.middleware.js.map