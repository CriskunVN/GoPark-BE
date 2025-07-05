import express from 'express';
import { searchParkingLots } from '../controllers/search.controller.js';

const router = express.Router();

router.get('/city', searchParkingLots);

export default router;
