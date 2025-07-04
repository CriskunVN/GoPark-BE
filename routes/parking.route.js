import express from 'express';
import { searchParkingLots } from '../controllers/parking.controller.js';

const router = express.Router();

router.get('/search', searchParkingLots);

export default router;
