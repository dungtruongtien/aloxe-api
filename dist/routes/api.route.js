"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _keyword = _interopRequireDefault(require("./keyword.route"));
var _user = _interopRequireDefault(require("./user.route"));
var _auth = _interopRequireDefault(require("./auth.route"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = _express.default.Router();
router.use('/keyword/v1', _keyword.default);
router.use('/user/v1', _user.default);
router.use('/auth/v1', _auth.default);
var _default = exports.default = router;