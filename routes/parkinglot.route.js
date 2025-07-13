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
// Bảo vệ tất cả các route bên dưới
// ========================
router.use(authController.protect);

// ========================
// Route cho Parking Owner
// ========================
router.get(
  '/my-parkinglots',
  authController.restrictTo('owner'),
  parkingLotController.getMyParkingLots
);

router.post(
  '/',
  authController.restrictTo('owner'),
  parkingLotController.createParkingLot
);

router
  .route('/:id')
  .get(
    authController.restrictTo('owner'),
    parkingLotController.getParkingLotById
  )
  .patch(
    authController.restrictTo('owner'),
    parkingLotController.updateParkingLot
  )
  .delete(
    authController.restrictTo('owner'),
    parkingLotController.deleteParkingLot
  );

// ========================
// Xóa mềm
// ========================
router.patch(
  '/:id/soft-delete',
  authController.restrictTo('owner'),
  parkingLotController.softDeleteParkingLot
);

// ========================
// Admin quyền toàn bộ (nếu cần dùng riêng)
// ========================
router.get(
  '/',
  authController.restrictTo('admin'),
  parkingLotController.getAllParkingLots || ((req, res) => {
    res.status(501).json({
      status: 'error',
      message: 'Chức năng chưa được hỗ trợ',
    });
  })
);

export default router;
