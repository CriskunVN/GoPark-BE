import express from 'express';
import {
  getMyVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehiclesByUserId,
  addVehicleForUser,
} from '../controllers/vehicle.controller.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

// Áp dụng middleware bảo vệ
router.use(authController.protect);

// Routes cho người dùng hiện tại
router.get('/my-vehicles', getMyVehicles);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

// Routes cho admin / owner thao tác theo userId
router.get('/by-user/:userId', getVehiclesByUserId);
router.post('/for-user/:userId', addVehicleForUser);

export default router;
