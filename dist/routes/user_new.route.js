import express from 'express';
import { createUser, getAllUsers, getUser, updateUser, deleteUser } from '../controllers/user.controller.js';
const router = express.Router();
// Tất cả routes đều yêu cầu quyền admin
// Tạo user mới
router.post('/', createUser);
// Lấy danh sách users
router.get('/', getAllUsers);
// Lấy thông tin 1 user
router.get('/:id', getUser);
// Cập nhật user
router.put('/:id', updateUser);
// Xóa user
router.delete('/:id', deleteUser);
export default router;
//# sourceMappingURL=user_new.route.js.map