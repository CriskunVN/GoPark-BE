import * as ticketController from '../controllers/ticket.controller.js';
import express from 'express';

const router = express.Router();

// Checkin ticket (POST /tickets/:id/checkin)
router.route('/:ticketId/checkin').post(ticketController.checkin);

// Checkout ticket (POST /tickets/:id/checkout)
router.route('/:ticketId/checkout').post(ticketController.checkout);

export default router;
