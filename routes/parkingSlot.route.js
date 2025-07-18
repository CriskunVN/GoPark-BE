import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as ParkingSlot from '../controllers/parkingSlot.controller.js';
const router = express.Router();

// Route Public
// Lấy các slot bãi đỗ xe có sẵn theo bãi đỗ xe và thời gian
// GET /api/v1/parking-slots/by-date/:parkingLotId?startTime=2025-07-17T00:00:00.000Z&endTime=2025-07-17T23:59:59.999Z
router.route('/by-date/:parkingLotId').get(ParkingSlot.getSlotsAvailableByDate);

// Dùng để bảo vệ tất cả các route bên dưới
router.use(authController.protect);

router
  .route('/')
  .get(authController.restrictTo('admin'), ParkingSlot.getAllParkingSlots)
  .post(ParkingSlot.createParkingSlot);

router
  .route('/:id')
  .get(ParkingSlot.getParkingSlot)
  .delete(ParkingSlot.deleteParkingSlot)
  .patch(ParkingSlot.updateParkingSlot);

export default router;
