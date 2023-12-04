import express from 'express';
import { bookingDriverActionCtr, createBookingCtr, detailBookingCtr, listBookingCtr, updateBookingCtr } from '../controllers/booking.controller';
import { authenticate } from '../middlewares/auth.middleware';
const router = express.Router();

router.get('/', listBookingCtr);

router.get('/:id', detailBookingCtr);

router.post('/', createBookingCtr);

router.put('/booking-action', authenticate , bookingDriverActionCtr);

router.put('/:id', updateBookingCtr);



export default router;