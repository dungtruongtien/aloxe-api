"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleRegisterSv = exports.handleMeSv = void 0;
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
var _user = _interopRequireDefault(require("../models/user.model"));
var _customError = require("../common/customError");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const handleRegisterSv = async ({
  email,
  password,
  fullName
}) => {
  const existsEmail = await _user.default.findOne({
    where: {
      email
    }
  });
  if (existsEmail) {
    throw new _customError.BusinessError('This email was registerd', 'RegisterdEmail');
  }
  var salt = _bcryptjs.default.genSaltSync(10);
  const hashedPassword = _bcryptjs.default.hashSync(password, salt);
  const userInput = {
    email,
    fullName,
    password: hashedPassword
  };
  const user = await _user.default.create(userInput);
  return user;
};
exports.handleRegisterSv = handleRegisterSv;
const handleMeSv = async userId => {
  const userData = await _user.default.findOne({
    where: {
      id: userId
    },
    attributes: ['email', 'fullName', 'name', 'id']
  });
  if (!userData) {
    throw new _customError.BusinessError('User not existed', 'UserNotFound');
  }
  return userData;
};
exports.handleMeSv = handleMeSv;