import express from 'express';
import { handleDriverOnlineCtr, handleMeCtr, handleRegisterCtr } from '../controllers/user.controller';
const router = express.Router();

router.post('/register', handleRegisterCtr)

router.get('/me', handleMeCtr)

router.put('/online', handleDriverOnlineCtr)


export default router;