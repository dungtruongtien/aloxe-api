import express from 'express';
import { handleLoginCtr, handleLogoutCtr, handleRefreshTokenCtr } from '../controllers/auth.controller';
const router = express.Router();

router.post('/login', handleLoginCtr);

router.post('/logout', handleLogoutCtr);

router.post('/token/access', handleRefreshTokenCtr);


export default router;