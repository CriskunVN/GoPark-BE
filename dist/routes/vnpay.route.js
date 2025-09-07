import express from 'express';
import * as vnpay from '../controllers/vnpay.controller.js';
const router = express.Router();
router.post('/create-payment/:invoiceNumber', vnpay.createPayment);
router.get('/payment-return', vnpay.returnPayment);
export default router;
//# sourceMappingURL=vnpay.route.js.map