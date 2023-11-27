import express from 'express';
import { handleMeCtr, handleRegisterCtr } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
const router = express.Router();

router.post('/register', handleRegisterCtr)

router.get('/me', handleMeCtr)


export default router;