"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.set = exports.initMemcache = exports.get = void 0;
var _redis = require("redis");
var _init = _interopRequireDefault(require("../config/init"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
let GLOBAL_MEMCACHE_CLIENT = null;
const initMemcache = async () => {
  GLOBAL_MEMCACHE_CLIENT = await (0, _redis.createClient)({
    url: `redis://${_init.default.memCache.host}:${_init.default.memCache.port}`
  }).on('error', err => {
    console.log('Redis Client Error', err);
    process.exit(1);
  }).connect();
};
exports.initMemcache = initMemcache;
const set = (key, value) => {
  return GLOBAL_MEMCACHE_CLIENT.set(key, value);
};
exports.set = set;
const get = key => {
  return GLOBAL_MEMCACHE_CLIENT.get(key);
};
exports.get = get;