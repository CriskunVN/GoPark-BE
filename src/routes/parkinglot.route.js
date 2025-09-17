import express from 'express';
import * as parkingLotController from '../controllers/parkinglot.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import parkingSlotRoute from './parkingSlot.route.js';

const router = express.Router();

// ========================
// Route công khai (không yêu cầu auth)
// ========================
router.get('/public/all', parkingLotController.getAllParkingLots);
router.get('/:id/public', parkingLotController.getParkingLotById);
router.get('/city/:city', parkingLotController.getParkingLotsByCity);

//  Thêm route công khai mới cho FE gọi danh sách slots
router.get(
  '/:parkingLotId/slots-public',
  parkingLotController.getAllParkingSlotsByLotId
);

// ========================
// Nested Route cho Slots (yêu cầu auth nếu middleware được áp dụng ở bên trong route slot)
// ========================
router.use('/:parkingLotId/slots', parkingSlotRoute);

// ========================
// Bảo vệ tất cả các route bên dưới
// ========================
router.use(protect);

// ========================
// Route cho Parking Owner
// ========================
router.get(
  '/my-parkinglots',
  restrictTo('owner'),
  parkingLotController.getMyParkingLots
);
router.route('/:id').get(parkingLotController.getOneParkingLot);

router.post(
  '/',
  restrictTo('owner', 'admin'),
  parkingLotController.createParkingLot
);

router.patch(
  '/:id/soft-delete',
  restrictTo('owner'),
  parkingLotController.softDeleteParkingLot
);

router.route('/:id/users').get(parkingLotController.getUserBookingInParkingLot);

// ========================
// Admin quyền toàn bộ
// ========================
router.use(restrictTo('admin'));
router.get('/', parkingLotController.getAllParkingLots);

router
  .route('/:id')
  .patch(restrictTo('owner'), parkingLotController.updateParkingLot)
  .delete(parkingLotController.deleteParkingLot);

export default router;
