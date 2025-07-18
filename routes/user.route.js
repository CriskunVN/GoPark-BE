import express from 'express';

import {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controllers/auth.controller.js';

import * as userController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// ✅ Middleware: bảo vệ các route dưới
router.use(protect);

// ✅ Route: Lấy thông tin người dùng hiện tại
router.get('/me', userController.getCurrentUser);

// ✅ Route: Cập nhật mật khẩu người dùng hiện tại
router.patch('/updateMyPassword', updatePassword);

// ✅ Chỉ admin mới được truy cập các route dưới
router.use(restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
