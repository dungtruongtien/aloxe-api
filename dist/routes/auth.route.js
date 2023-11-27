"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _auth = require("../controllers/auth.controller");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = _express.default.Router();
router.post('/login', _auth.handleLoginCtr);
router.post('/logout', _auth.handleLogoutCtr);
router.post('/token/access', _auth.handleRefreshTokenCtr);
var _default = exports.default = router;