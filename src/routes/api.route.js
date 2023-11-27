import express from 'express';

import userRouterHandler from './user.route'
import authRouterHandler from './auth.route'

const router = express.Router();

router.use('/user/v1', userRouterHandler);
router.use('/auth/v1', authRouterHandler);



export default router;