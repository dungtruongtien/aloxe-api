"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleRefreshTokenSv = exports.handleLogoutSv = exports.handleLoginSv = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
var _dateFns = require("date-fns");
var _user = _interopRequireDefault(require("../models/user.model"));
var _auth = _interopRequireDefault(require("../models/auth.model"));
var _customError = require("../common/customError");
var _constant = require("../common/constant");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const handleLoginSv = async ({
  email,
  password
}) => {
  const existsUser = await _user.default.findOne({
    where: {
      email
    }
  });
  if (!existsUser) {
    throw new _customError.NotfoundError('User not existed', 'UserNotFound');
  }
  const isEqual = _bcryptjs.default.compareSync(password, existsUser.password);
  if (!isEqual) {
    throw new _customError.BusinessError('Username or password is wrong', 'AuthenticationFailed');
  }
  const accessTokenExpiryIn = (0, _dateFns.addSeconds)(new Date(), _constant.ACCESS_TOKEN_EXPIRY_ON_SECOND).getTime();
  const refreshTokenExpiryIn = (0, _dateFns.addSeconds)(new Date(), _constant.REFRESH_TOKEN_EXPIRY_ON_SECOND).getTime();
  const accessToken = _jsonwebtoken.default.sign({
    userId: existsUser.id,
    email,
    type: 'access'
  }, _constant.AUTH_ACCESS_SERCRET_KEY, {
    expiresIn: _constant.ACCESS_TOKEN_EXPIRY_ON_SECOND
  });
  const refreshToken = _jsonwebtoken.default.sign({
    userId: existsUser.id,
    type: 'refresh'
  }, _constant.AUTH_REFRESH_SERCRET_KEY, {
    expiresIn: _constant.REFRESH_TOKEN_EXPIRY_ON_SECOND
  });
  await _auth.default.destroy({
    where: {
      userId: existsUser.id
    }
  });
  await _auth.default.upsert({
    userId: existsUser.id,
    refreshToken
  });
  return {
    userId: existsUser.id,
    accessToken,
    accessTokenExpiryIn,
    refreshToken,
    refreshTokenExpiryIn
  };
};
exports.handleLoginSv = handleLoginSv;
const handleLogoutSv = async userId => {
  return _auth.default.destroy({
    where: {
      id: userId
    }
  });
};
exports.handleLogoutSv = handleLogoutSv;
const handleRefreshTokenSv = async ({
  refreshToken,
  userId
}) => {
  return _jsonwebtoken.default.verify(refreshToken, _constant.AUTH_REFRESH_SERCRET_KEY, async (error, decoded) => {
    if (error) {
      // Force logout if refresh token is expired
      if (error.name === 'TokenExpiredError') {
        await _auth.default.destroy({
          where: {
            userId
          }
        });
        throw new _customError.AuthenticationError('Token is expired', 'TokenExpiredError');
      }
      throw new _customError.AuthenticationError('Invalid token');
    }

    // Check refreshToken of current user is valid
    if (!decoded.userId) {
      throw new _customError.AuthenticationError('Invalid token');
    }
    const existedRefreshToken = await _auth.default.findOne({
      where: {
        userId: decoded.userId
      }
    });
    if (!existedRefreshToken) {
      throw new _customError.AuthenticationError('Invalid token');
    }
    if (existedRefreshToken.refreshToken !== refreshToken) {
      throw new _customError.AuthenticationError('Invalid token');
    }
    const existsUser = await _user.default.findOne({
      where: {
        id: decoded.userId
      }
    });
    if (!existsUser) {
      throw new _customError.NotfoundError('User not existed', 'UserNotFound');
    }
    const accessTokenExpiryIn = (0, _dateFns.addSeconds)(new Date(), _constant.ACCESS_TOKEN_EXPIRY_ON_SECOND).getTime();
    const accessToken = _jsonwebtoken.default.sign({
      userId: decoded.userId,
      email: existsUser.email,
      type: 'access'
    }, _constant.AUTH_ACCESS_SERCRET_KEY, {
      expiresIn: _constant.ACCESS_TOKEN_EXPIRY_ON_SECOND
    });
    return {
      accessToken,
      accessTokenExpiryIn
    };
  });
};
exports.handleRefreshTokenSv = handleRefreshTokenSv;