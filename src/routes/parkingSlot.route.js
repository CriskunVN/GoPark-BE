import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as ParkingSlot from '../controllers/parkingSlot.controller.js';
const router = express.Router();

// Route Public
router.route('/by-date/:parkingLotId').get(ParkingSlot.getSlotsAvailableByDate);

// Route lấy chi tiết booking của một slot
router.route('/:slotId/bookings').get(ParkingSlot.getSlotBookings);

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

router
  .route('/bookedSlots/:parkingLotId')
  .get(authController.restrictTo('owner'), ParkingSlot.getSlotsBookedByDateForOwner);

router
  .route('/availableSlots/:parkingLotId')
  .get(authController.restrictTo('owner'), ParkingSlot.getSlotsAvailableByDateForOwner);

export default router;