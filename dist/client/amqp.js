"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pushToQueue = exports.initMessageQueueConnection = exports.connection = exports.GLOBAL_MQ_CONN = void 0;
var _amqplib = _interopRequireDefault(require("amqplib"));
var _init = _interopRequireDefault(require("../config/init"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
let GLOBAL_MQ_CONN = exports.GLOBAL_MQ_CONN = null;
const connection = () => {
  return _amqplib.default.connect(`amqp://${_init.default.messageQueue.amqpUser}:${_init.default.messageQueue.amqpPassword}@${_init.default.messageQueue.amqpHost}:${_init.default.messageQueue.amqpPort}/`);
};
exports.connection = connection;
const initMessageQueueConnection = async () => {
  exports.GLOBAL_MQ_CONN = GLOBAL_MQ_CONN = await connection();
};
exports.initMessageQueueConnection = initMessageQueueConnection;
const pushToQueue = (ch, queueName, msg) => {
  ch.assertQueue(queueName, {
    durable: true
  });
  ch.sendToQueue(queueName, Buffer.from(msg), {
    persistent: true
  });

  // console.log("Message sent");
};
exports.pushToQueue = pushToQueue;