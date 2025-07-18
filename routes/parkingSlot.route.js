import express from "express";
import * as authController from "../controllers/auth.controller.js";
import * as ParkingSlot from "../controllers/parkingSlot.controller.js";
const router = express.Router();

// Dùng để bảo vệ tất cả các route bên dưới
router.use(
  authController.protect,
  authController.restrictTo("admin", "parking_owner")
);

router
  .route("/")
  .get(ParkingSlot.getAllParkingSlots)
  .post(ParkingSlot.createParkingSlot);

router
  .route("/:id")
  .get(ParkingSlot.getParkingSlot)
  .delete(ParkingSlot.deleteParkingSlot)
  .patch(ParkingSlot.updateParkingSlot);

// Lấy các slot theo ngày
// GET /api/v1/parking-slots/by-date/:parkingLotId?date=2025-07-17
router.route("/by-date/:parkingLotId").get(ParkingSlot.getSlotsByDate);

export default router;
