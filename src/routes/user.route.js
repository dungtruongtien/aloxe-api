import express from 'express';
import { handleDriverOnlineCtr, handleMeCtr, handleRegisterCtr } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
const router = express.Router();

router.post('/register', handleRegisterCtr)

router.get('/me', authenticate, handleMeCtr)

router.put('/online', authenticate, handleDriverOnlineCtr)


export default router;