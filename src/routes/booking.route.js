import express from 'express';
import { listBookingCtr } from '../controllers/booking.controller';
const router = express.Router();

router.get('/', listBookingCtr);


export default router;