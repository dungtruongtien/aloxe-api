"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleRegisterCtr = exports.handleMeCtr = void 0;
var _validator = require("../utils/validator");
var _user = require("../services/user.service");
const handleRegisterCtr = async (req, res, next) => {
  try {
    // Validate
    validateRegisterInput(req);

    // Handle business logic
    const registerInput = req.body;
    const user = await (0, _user.handleRegisterSv)(registerInput);
    res.status(201).json({
      data: 'Register successfully',
      status: 'SUCCESS',
      data: user
    });
  } catch (err) {
    next(err);
  }
};
exports.handleRegisterCtr = handleRegisterCtr;
const handleMeCtr = async (req, res, next) => {
  try {
    // Handle business logic
    const {
      user: {
        userId
      }
    } = res.locals;
    const user = await (0, _user.handleMeSv)(userId);
    res.status(200).json({
      data: 'Register successfully',
      status: 'SUCCESS',
      data: user
    });
  } catch (err) {
    next(err);
  }
};
exports.handleMeCtr = handleMeCtr;
const validateRegisterInput = req => {
  if (!req.body) {
    throw new Error('Missing body input');
  }
  _validator.validator.obj.required(req.body, 'email');
  _validator.validator.obj.required(req.body, 'password');
  const {
    email,
    password,
    fullName
  } = req.body;
  _validator.validator.string.isString(email, 'email');
  _validator.validator.string.isString(password, 'password');
  _validator.validator.string.isString(fullName, 'fullName');
  _validator.validator.string.isEmail(email);
};