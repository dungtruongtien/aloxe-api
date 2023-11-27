"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _user = require("../controllers/user.controller");
var _auth = require("../middlewares/auth.middleware");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = _express.default.Router();
router.post('/register', _user.handleRegisterCtr);
router.get('/me', _user.handleMeCtr);
var _default = exports.default = router;