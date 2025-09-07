import express from 'express';
import { searchParkingLots, searchParkingNearMe, } from '../controllers/search.controller.js';
const router = express.Router();
router.get('/city', searchParkingLots);
router.get('/nearby/lat/:lat/lng/:lng/radius/:radius', searchParkingNearMe);
export default router;
//# sourceMappingURL=search.route.js.map