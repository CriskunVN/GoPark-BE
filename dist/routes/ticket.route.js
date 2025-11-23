import * as ticketController from '../controllers/ticket.controller.js';
import express from 'express';
const router = express.Router();
// Lấy ticket theo ID (GET /tickets/:ticketId)
router.route('/:ticketId').get(ticketController.getTicketbyId);
// Checkin ticket (POST /tickets/:ticketId/checkin)
router.route('/:ticketId/checkin').post(ticketController.checkin);
// Checkout ticket (POST /tickets/:ticketId/checkout)
router.route('/:ticketId/checkout').post(ticketController.checkout);
export default router;
//# sourceMappingURL=ticket.route.js.map