import express from 'express';
import * as parkingLotController from '../controllers/parkinglot.controller.js';
import * as authController from '../controllers/auth.controller.js';
import parkingSlotRoute from './parkingSlot.route.js';
const router = express.Router();

// router.use('/:slotID', parkingSlotRoute);

// Sử dụng cho tất cả các route
router.use(
  authController.protect,
  authController.restrictTo('admin', 'parking_owner')
);

// Route để lấy tất cả bãi đỗ xe hoặc tạo bãi đỗ xe mới
router
  .route('/')
  .get(parkingLotController.getAllParkingLots)
  .post(parkingLotController.createParkingLot);

// Route để lấy, cập nhật hoặc xóa bãi đỗ xe theo ID
router
  .route('/:id')
  .get(parkingLotController.getParkingLot)
  .patch(parkingLotController.updateParkingLot)
  .delete(
    authController.restrictTo('admin'), // only admin
    parkingLotController.deleteParkingLot
  );

router
  .route('/:id/soft-delete')
  .patch(parkingLotController.softDeleteParkingLot);

// // Route để tìm kiếm bãi đỗ xe theo tên
// router.route('/search').get(parkingLotController.searchParkingLots);

// // Route để lấy bãi đỗ xe gần vị trí hiện tại
// router.route('/nearby').get(parkingLotController.getNearbyParkingLots);

export default router;
