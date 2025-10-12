import express from 'express';
import { signup, login, forgotPassword, resetPassword, updatePassword, refreshToken, verifyEmail, } from '../controllers/auth.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import * as userController from '../controllers/user.controller.js';
const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.post('/refresh-token', refreshToken);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/verify-email/:token', verifyEmail);
// Middleware: bảo vệ các route dưới
router.use(protect);
// Route: Lấy thông tin người dùng hiện tại
router.get('/me', userController.getCurrentUser);
// Route: Cập nhật mật khẩu người dùng hiện tại
router.patch('/updateMyPassword', updatePassword);
router.route('/').get(restrictTo('admin'), userController.getAllUsers);
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(restrictTo('admin'), userController.deleteUser);
export default router;
//# sourceMappingURL=user.route.js.map