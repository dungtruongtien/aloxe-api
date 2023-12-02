import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { addSeconds } from 'date-fns';

import User from '../models/user.model';
import Auth from '../models/auth.model';
import { AuthenticationError, BusinessError, NotfoundError } from '../common/customError';
import { ACCESS_TOKEN_EXPIRY_ON_SECOND, AUTH_ACCESS_SERCRET_KEY, AUTH_REFRESH_SERCRET_KEY, REFRESH_TOKEN_EXPIRY_ON_SECOND } from '../common/constant';
import Customer from '../models/customer.model';
import Driver from '../models/driver.model';
import Staff from '../models/staff.model';

export const handleLoginSv = async ({ phoneNumber, password }) => {
  const existsUser = await User.findOne({
    where: { phoneNumber },
  });
  if (!existsUser) {
    throw new NotfoundError('User not existed', 'UserNotFound');
  }

  const auth = await Auth.findOne({ where: { userId: existsUser.id } });
  const customer = await Customer.findOne({ where: { userId: existsUser.id } });
  const driver = await Driver.findOne({ where: { userId: existsUser.id } });
  const staff = await Staff.findOne({ where: { userId: existsUser.id } });

  const accessTokenPayload = {
    userId: existsUser.id,
    customer: customer ? { id: customer.id } : {},
    driver: driver ? { id: driver.id } : {},
    staff: staff ? { id: staff.id } : {},
  }


  const isEqual = bcrypt.compareSync(password, auth.password);
  if (!isEqual) {
    throw new BusinessError('Username or password is wrong', 'AuthenticationFailed');
  }

  const accessTokenExpiryIn = addSeconds(new Date(), ACCESS_TOKEN_EXPIRY_ON_SECOND).getTime();
  const refreshTokenExpiryIn = addSeconds(new Date(), REFRESH_TOKEN_EXPIRY_ON_SECOND).getTime();

  const accessToken = jwt.sign(accessTokenPayload, AUTH_ACCESS_SERCRET_KEY);
  const refreshToken = jwt.sign({ userId: existsUser.id, type: 'refresh' }, AUTH_REFRESH_SERCRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRY_ON_SECOND });

  return { 
    userId: existsUser.id, 
    accessToken, 
    accessTokenExpiryIn, 
    refreshToken, 
    refreshTokenExpiryIn, 
    role: existsUser.role,
    fullName: existsUser.fullName,
    customerId: customer ? customer.id : null,
    driverId: driver ? driver.id : null,
    staffId: staff ? staff.id : null,
    phoneNumber,
    email: existsUser.email
  }
}

export const handleLogoutSv = async (userId) => {
  return Auth.destroy({ where: { id: userId } });
}


export const handleRefreshTokenSv = async ({ refreshToken, userId }) => {
  return jwt.verify(refreshToken, AUTH_REFRESH_SERCRET_KEY, async (error, decoded) => {
    if (error) {
      // Force logout if refresh token is expired
      if (error.name === 'TokenExpiredError') {
        await Auth.destroy({ where: { userId } });
        throw new AuthenticationError('Token is expired', 'TokenExpiredError');
      }

      throw new AuthenticationError('Invalid token')
    }


    // Check refreshToken of current user is valid
    if (!decoded.userId) {
      throw new AuthenticationError('Invalid token');
    }

    const existedRefreshToken = await Auth.findOne({ where: { userId: decoded.userId } });
    if (!existedRefreshToken) {
      throw new AuthenticationError('Invalid token');
    }

    if (existedRefreshToken.refreshToken !== refreshToken) {
      throw new AuthenticationError('Invalid token');
    }

    const existsUser = await User.findOne({ where: { id: decoded.userId } });
    if (!existsUser) {
      throw new NotfoundError('User not existed', 'UserNotFound');
    }

    const accessTokenExpiryIn = addSeconds(new Date(), ACCESS_TOKEN_EXPIRY_ON_SECOND).getTime();

    const accessToken = jwt.sign({ userId: decoded.userId, email: existsUser.email, type: 'access' }, AUTH_ACCESS_SERCRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRY_ON_SECOND });

    return { accessToken, accessTokenExpiryIn };
  });
}
