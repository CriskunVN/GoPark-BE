// routes/parkinglot.route.js
import express from 'express';
import * as parkingLotController from '../controllers/parkinglot.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import parkingSlotRoute from './parkingSlot.route.js';
const router = express.Router();
// ========================
// PUBLIC ROUTES (không yêu cầu auth)
// ========================
router.get('/public/all', parkingLotController.getAllParkingLots);
router.get('/:id/public', parkingLotController.getParkingLotById);
router.get('/city/:city', parkingLotController.getParkingLotsByCity);
// Public slots of a parking lot
router.get('/:parkingLotId/slots-public', parkingLotController.getAllParkingSlotsByLotId);
// ========================
// Nested route cho ParkingSlots (có thể có middleware riêng)
// ========================
router.use('/:parkingLotId/slots', parkingSlotRoute);
// ========================
// PROTECTED ROUTES (bắt buộc login)
// ========================
router.use(protect);
// ----- Owner routes -----
router.get('/my-parkinglots', restrictTo('owner'), parkingLotController.getMyParkingLots);
router.post('/', restrictTo('owner', 'admin'), parkingLotController.createParkingLot);
router.patch('/:id/soft-delete', restrictTo('owner'), parkingLotController.softDeleteParkingLot);
router
    .route('/:id')
    .get(parkingLotController.getOneParkingLot) // owner xem bãi của mình
    .patch(restrictTo('owner'), parkingLotController.updateParkingLot) // owner update
    .delete(restrictTo('owner'), parkingLotController.deleteParkingLot); // owner xóa
router.get('/:id/users', parkingLotController.getUserBookingInParkingLot);
// ----- Admin routes -----
router.use(restrictTo('admin'));
router.get('/', parkingLotController.getAllParkingLots);
router.delete('/:id', parkingLotController.deleteParkingLot); // admin xóa bất kỳ
export default router;
//# sourceMappingURL=parkinglot.route.js.map