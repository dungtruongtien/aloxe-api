"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.REFRESH_TOKEN_EXPIRY_ON_SECOND = exports.CRAWLER_QUEUE_NAME = exports.AUTH_REFRESH_SERCRET_KEY = exports.AUTH_ACCESS_SERCRET_KEY = exports.ACCESS_TOKEN_EXPIRY_ON_SECOND = void 0;
const AUTH_ACCESS_SERCRET_KEY = exports.AUTH_ACCESS_SERCRET_KEY = "ACCESS_KEWE_CRAWLER_SECRET";
const AUTH_REFRESH_SERCRET_KEY = exports.AUTH_REFRESH_SERCRET_KEY = "REFRES_KEWE_CRAWLER_SECRET";
const ACCESS_TOKEN_EXPIRY_ON_SECOND = exports.ACCESS_TOKEN_EXPIRY_ON_SECOND = 60 * 5; // 5 minutes
const REFRESH_TOKEN_EXPIRY_ON_SECOND = exports.REFRESH_TOKEN_EXPIRY_ON_SECOND = 60 * 60 * 24 * 7; // 7 days
const CRAWLER_QUEUE_NAME = exports.CRAWLER_QUEUE_NAME = 'keyword_crawling';