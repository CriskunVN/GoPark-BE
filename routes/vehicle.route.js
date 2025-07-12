import express from 'express';
import { getMyVehicles, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicle.controller.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.use(authController.protect); // Áp dụng middleware bảo vệ cho tất cả route

router.get('/my-vehicles', getMyVehicles);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;