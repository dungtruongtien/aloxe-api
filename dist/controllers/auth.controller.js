"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleRefreshTokenCtr = exports.handleLogoutCtr = exports.handleLoginCtr = void 0;
var _validator = require("../utils/validator");
var _auth = require("../services/auth.service");
var _customError = require("../common/customError");
const handleLoginCtr = async (req, res, next) => {
  try {
    // Validate
    validateLoginInput(req);

    // Handle business logic
    const loginUser = req.body;
    const token = await (0, _auth.handleLoginSv)(loginUser);
    res.status(200).json({
      status: 'SUCCESS',
      data: token
    });
  } catch (err) {
    next(err);
  }
};
exports.handleLoginCtr = handleLoginCtr;
const handleLogoutCtr = async (req, res, next) => {
  try {
    // Validate
    validateLogoutInput(req);

    // Handle business logic
    const {
      userId
    } = req.body;
    const token = await (0, _auth.handleLogoutSv)(userId);
    res.status(200).json({
      status: 'SUCCESS'
    });
  } catch (err) {
    next(err);
  }
};
exports.handleLogoutCtr = handleLogoutCtr;
const handleRefreshTokenCtr = async (req, res, next) => {
  try {
    // Validate
    validateRefreshTokenInput(req);

    // Handle business logic
    const {
      refreshToken,
      userId
    } = req.body;
    const token = await (0, _auth.handleRefreshTokenSv)({
      refreshToken,
      userId
    });
    res.status(200).json({
      status: 'SUCCESS',
      data: token
    });
  } catch (err) {
    next(err);
  }
};
exports.handleRefreshTokenCtr = handleRefreshTokenCtr;
const validateLoginInput = req => {
  if (!req.body) {
    throw new _customError.ValidationError('Missing body input');
  }
  _validator.validator.obj.required(req.body, 'email');
  _validator.validator.obj.required(req.body, 'password');
  const {
    email,
    password
  } = req.body;
  _validator.validator.string.isString(email, 'email');
  _validator.validator.string.isString(password, 'password');
  _validator.validator.string.isEmail(email);
};
const validateLogoutInput = req => {
  if (!req.body) {
    throw new _customError.ValidationError('Missing body input');
  }
  _validator.validator.obj.required(req.body, 'userId');
  const {
    userId
  } = req.body;
  _validator.validator.number.isNumber(userId);
};
const validateRefreshTokenInput = req => {
  if (!req.body) {
    throw new _customError.ValidationError('Missing body input');
  }
  _validator.validator.obj.required(req.body, 'refreshToken');
  _validator.validator.obj.required(req.body, 'userId');
  const {
    refreshToken,
    userId
  } = req.body;
  _validator.validator.string.isString(refreshToken, 'refreshToken');
  _validator.validator.number.isNumber(userId, 'userId');
};