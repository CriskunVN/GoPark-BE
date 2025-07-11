import express from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getMyVehicles,
  getVehiclesByUser,       // ✅ mới
  createVehicleForUser     // ✅ mới
} from '../controllers/vehicle.controller.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

// Public routes for Admin via FE (no token needed)
router.get('/by-user/:userId', getVehiclesByUser);
router.post('/for-user/:userId', createVehicleForUser);

// Public routes
router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

// Protected routes
router.use(authController.protect);

router.get('/my-vehicles', getMyVehicles);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
