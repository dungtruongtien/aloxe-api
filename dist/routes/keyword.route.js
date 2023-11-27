"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _keyword = require("../controllers/keyword.controller");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = _express.default.Router();
router.get('/', _keyword.handleListKeywordCtr);
router.get('/process/tracking', _keyword.handleKeywordProcessTrackingCtr);
router.post('/upload', _keyword.handleKeywordCrawlerCtr);
var _default = exports.default = router;