import express from 'express';
import { createBookingCtr, listBookingCtr } from '../controllers/booking.controller';
const router = express.Router();

router.get('/', listBookingCtr);

router.post('/', createBookingCtr);


export default router;