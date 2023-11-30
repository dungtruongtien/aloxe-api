import express from 'express';
import { createBookingCtr, detailBookingCtr, listBookingCtr, updateBookingCtr } from '../controllers/booking.controller';
const router = express.Router();

router.get('/', listBookingCtr);

router.get('/:id', detailBookingCtr);

router.post('/', createBookingCtr);

router.put('/:id', updateBookingCtr);


export default router;