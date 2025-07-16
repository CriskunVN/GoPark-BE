import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as ParkingSlot from '../controllers/parkingSlot.controller.js';
const router = express.Router();

// Dùng để bảo vệ tất cả các route bên dưới
router.use(
  authController.protect,
  authController.restrictTo('admin', 'parking_owner')
);

router
  .route('/')
  .get(ParkingSlot.getAllParkingSlots)
  .post(ParkingSlot.createParkingSlot);

router
  .route('/:id')
  .get(ParkingSlot.getParkingSlot)
  .delete(ParkingSlot.deleteParkingSlot)
  .patch(ParkingSlot.updateParkingSlot);

export default router;
