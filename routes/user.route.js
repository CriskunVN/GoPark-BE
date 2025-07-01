import express from 'express';

import {
  signup,
  login,
  protect, // protect dùng để bảo vệ các route yêu cầu người dùng đã đăng nhập
  restrictTo, // restrictTo dùng để giới hạn quyền truy cập vào các route chỉ cho một số vai trò nhất định
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controllers/auth.controller.js';

import * as userController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/signup', signup); // Đăng ký người dùng mới
router.post('/login', login); // Đăng nhập người dùng
router.post('/forgotPassword', forgotPassword); // Quên mật khẩu, gửi email reset mật khẩu
router.patch('/resetPassword/:token', resetPassword); // Reset mật khẩu bằng token

// authentication Middleware (chỉ cho phép người dùng đã đăng nhập)
router.use(protect); // Bảo vệ các route bên dưới, yêu cầu người dùng đã đăng nhập

router.patch('/updateMyPassword', updatePassword);

// Chỉ dành cho role 'admin'
router.use(restrictTo('admin'));

router.route('/').get(userController.getAllUsers); // Lấy tất cả người dùng
router
  .route('/:id')
  .get(userController.getUser) // Lấy người dùng theo ID
  .patch(userController.updateUser) // Cập nhật người dùng theo ID
  .delete(userController.deleteUser); // Xóa người dùng theo ID

export default router;
