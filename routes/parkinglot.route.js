import express from 'express';
import * as parkingLotController from '../controllers/parkinglot.controller.js';
import * as authController from '../controllers/auth.controller.js';
import parkingSlotRoute from './parkingSlot.route.js';

const router = express.Router();

// ========================
// Nested Route cho Slots
// ========================
router.use('/:parkingLotId/slots', parkingSlotRoute);

// ========================
// Route công khai
// ========================
router.get('/:id/public', parkingLotController.getParkingLotById);
router.get('/city/:city', parkingLotController.getParkingLotsByCity);
router.get(
  '/:parkingLotId/slots',
  parkingLotController.getAllParkingSlotsByLotId
); // Thêm endpoint này

// ========================
// Bảo vệ tất cả các route bên dưới
// ========================
router.use(authController.protect);

// ========================
// Route cho Parking Owner
// ========================
router.get(
  '/my-parkinglots',
  authController.restrictTo('owner'),
  parkingLotController.getMyParkingLots // Lấy danh sách bãi đỗ của chủ sở hữu
);

router.post(
  '/',
  authController.restrictTo('owner', 'admin'),
  parkingLotController.createParkingLot // Tạo bãi đỗ mới
);

router.patch(
  '/:id/soft-delete',
  authController.restrictTo('owner'),
  parkingLotController.softDeleteParkingLot // Xóa bãi đỗ (xóa mềm)
);

// ========================
// Admin quyền toàn bộ
// ========================
router.use(authController.restrictTo('admin'));
router.get('/', parkingLotController.getAllParkingLots); // Lấy tất cả bãi đỗ

router
  .route('/:id')
  .get(parkingLotController.getOneParkingLot) // Lấy thông tin bãi đỗ theo ID
  .patch(
    authController.restrictTo('owner'),
    parkingLotController.updateParkingLot // Cập nhật thông tin bãi đỗ
  )
  .delete(parkingLotController.deleteParkingLot); // Xóa bãi đỗ

export default router;
