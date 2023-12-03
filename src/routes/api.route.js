import express from 'express';

import userRouterHandler from './user.route'
import authRouterHandler from './auth.route'
import bookingRouterHandler from './booking.route'
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.use('/users', authenticate, userRouterHandler);
router.use('/auth', authRouterHandler);
router.use('/bookings', bookingRouterHandler);



export default router;