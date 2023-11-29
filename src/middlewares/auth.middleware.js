import jwt from "jsonwebtoken";

import { AUTH_ACCESS_SERCRET_KEY } from "../common/constant";
import { AuthenticationError } from "../common/customError";

const WHITE_LIST_APIS = ['/api/user/v1/register', '/api/auth/v1/login', '/api/auth/v1/token/access', '/api/auth/v1/logout']

export const authenticate = (req, res, next) => {
  if (WHITE_LIST_APIS.includes(req.originalUrl)) {
    next();
    return;
  }

  const token = req.headers['x-access-token'];
  if (!token) {
    throw new AuthenticationError('Authentication failed')
  }

  jwt.verify(token, AUTH_ACCESS_SERCRET_KEY, function (err, decoded) {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AuthenticationError('Authentication failed', 'TokenExpiredError');
      }

      throw new AuthenticationError('Authentication failed')
    }

    res.locals.user = { ...decoded };
    next();
    return;
  });
}