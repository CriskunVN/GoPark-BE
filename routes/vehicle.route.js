import express from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicle.controller.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

// Dùng để bảo vệ tất cả các route bên dưới
router.use(authController.protect, authController.restrictTo('admin', 'user'));

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
