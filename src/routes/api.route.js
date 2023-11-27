import express from 'express';

import userRouterHandler from './user.route'
import authRouterHandler from './auth.route'
import bookingRouterHandler from './booking.route'

const router = express.Router();

router.use('/user/v1', userRouterHandler);
router.use('/auth/v1', authRouterHandler);
router.use('/booking/v1', bookingRouterHandler);



export default router;