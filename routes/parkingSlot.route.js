import express from 'express';
import * as ParkingSlot from '../controllers/parkingSlot.controller.js';
const router = express.Router();

router
  .route('/')
  .get(ParkingSlot.getAllParkingSlots)
  .post(ParkingSlot.createParkingSlot);

export default router;
