"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_dotenv.default.config();
var _default = exports.default = {
  port: process.env.PORT || 8081,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    dialect: process.env.DB_DIALECT,
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASS,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT
  },
  memCache: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  messageQueue: {
    amqpHost: process.env.AMQP_HOST,
    amqpPort: process.env.AMQP_PORT,
    amqpUser: process.env.AMQP_USER,
    amqpPassword: process.env.AMQP_PASSWORD
  }
};