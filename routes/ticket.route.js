import * as ticketController from '../controllers/ticket.controller.js';
import express from 'express';

const router = express.Router();

// ...existing code...

// Checkin ticket (POST /tickets/:id/checkin)
router.route('/:id/checkin').post(ticketController.checkinTicket);

// Checkout ticket (POST /tickets/:id/checkout)
router.route('/:id/checkout').post(ticketController.checkoutTicket);

// ...existing code...
export default router;
