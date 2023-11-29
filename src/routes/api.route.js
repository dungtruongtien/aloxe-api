import express from 'express';

import userRouterHandler from './user.route'
import authRouterHandler from './auth.route'
import bookingRouterHandler from './booking.route'
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.use('/user/v1', authenticate, userRouterHandler);
router.use('/auth/v1', authRouterHandler);
router.use('/booking/v1', bookingRouterHandler);



export default router;