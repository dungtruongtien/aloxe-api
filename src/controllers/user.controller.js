import { validator } from '../utils/validator';
import { handleMeSv, handleRegisterSv } from '../services/user.service';

export const handleRegisterCtr = async (req, res, next) => {
  try {
    // Handle business logic
    const registerInput = req.body;
    const user = await handleRegisterSv(registerInput);
    res.status(201).json({
      data: 'Register successfully',
      status: 'SUCCESS',
      data: user
    })

  } catch (err) {
    next(err);
  }
}

export const handleMeCtr = async (req, res, next) => {
  try {
    // Handle business logic
    const { user: { userId }} = res.locals;
    const user = await handleMeSv(userId);
    res.status(200).json({
      data: 'Register successfully',
      status: 'SUCCESS',
      data: user
    })

  } catch (err) {
    next(err);
  }
}