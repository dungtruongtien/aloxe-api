"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleListKeywordSv = exports.handleKeywordProcessTrackingSv = exports.handleKeywordCrawlerSv = void 0;
var _keyword = _interopRequireDefault(require("../models/keyword.model"));
var _amqp = require("../client/amqp");
var _redis = require("../client/redis");
var _constant = require("../common/constant");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const handleKeywordCrawlerSv = async ({
  listKeywords,
  userId
}) => {
  //  Push to queue
  const mqChannel = await _amqp.GLOBAL_MQ_CONN.createChannel();

  //Save to memcache for tracking process
  const trackingKey = `crawler_tracking_${userId}_${new Date().getTime()}`;
  const data = await (0, _redis.set)(trackingKey, JSON.stringify({
    listKeywords,
    total: listKeywords.length
  }));
  if (!data || data !== 'OK') {
    throw new Error(`Cannot write tracking process ${trackingKey} to memcache`);
  }

  //Push to every single message queue
  const promiseAll = listKeywords.map(keyword => {
    return new Promise((resolve, reject) => {
      const message = {
        totalKeywords: listKeywords.length,
        trackingKey,
        keyword,
        userId
      };
      (0, _amqp.pushToQueue)(mqChannel, _constant.CRAWLER_QUEUE_NAME, JSON.stringify(message));
      resolve('DONE');
    });
  });
  await Promise.all(promiseAll);
  return {
    trackingKey
  };
};
exports.handleKeywordCrawlerSv = handleKeywordCrawlerSv;
const handleKeywordProcessTrackingSv = async ({
  trackingKey
}) => {
  return (0, _redis.get)(trackingKey);
};
exports.handleKeywordProcessTrackingSv = handleKeywordProcessTrackingSv;
const handleListKeywordSv = async ({
  userId,
  limit = 5,
  offset = 0,
  attributes
}) => {
  const filter = {
    userId
  };
  return _keyword.default.findAndCountAll({
    where: filter,
    order: [['id', 'DESC']],
    attributes,
    limit,
    offset
  });
};
exports.handleListKeywordSv = handleListKeywordSv;