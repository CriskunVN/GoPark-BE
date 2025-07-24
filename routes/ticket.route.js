import * as ticketController from '../controllers/ticket.controller.js';
import express from 'express';

const router = express.Router();

// ...existing code...

// Checkin ticket (POST /tickets/:id/checkin)
router.route('/:ticketId/checkin').post(ticketController.checkinTicket);

// Checkout ticket (POST /tickets/:id/checkout)
router.route('/:ticketId/checkout').post(ticketController.checkoutTicket);

// ...existing code...
export default router;
