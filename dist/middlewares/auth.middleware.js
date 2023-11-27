"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authenticate = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _constant = require("../common/constant");
var _customError = require("../common/customError");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const WHITE_LIST_APIS = ['/api/user/v1/register', '/api/auth/v1/login', '/api/auth/v1/token/access', '/api/auth/v1/logout'];
const authenticate = (req, res, next) => {
  if (WHITE_LIST_APIS.includes(req.originalUrl)) {
    next();
    return;
  }
  const token = req.headers['x-access-token'];
  if (!token) {
    throw new _customError.AuthenticationError('Authentication failed');
  }
  _jsonwebtoken.default.verify(token, _constant.AUTH_ACCESS_SERCRET_KEY, function (err, decoded) {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        throw new _customError.AuthenticationError('Authentication failed', 'TokenExpiredError');
      }
      throw new _customError.AuthenticationError('Authentication failed');
    }
    res.locals.user = decoded;
    next();
    return;
  });
};
exports.authenticate = authenticate;