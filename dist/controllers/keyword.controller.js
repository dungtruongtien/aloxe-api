"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleListKeywordCtr = exports.handleKeywordProcessTrackingCtr = exports.handleKeywordCrawlerCtr = void 0;
var _validator = require("../utils/validator");
var _keyword = require("../services/keyword.service");
const handleKeywordCrawlerCtr = async (req, res, next) => {
  try {
    // Validate
    validateKeywordCrawlerInput(req);

    // Handle business logic
    const {
      userId
    } = res.locals.user;
    const {
      listKeywords
    } = req.body;
    const resp = await (0, _keyword.handleKeywordCrawlerSv)({
      listKeywords,
      userId
    });
    res.status(200).json({
      message: 'Your list of keyword is crawling',
      status: 'SUCCESS',
      data: resp
    });
  } catch (err) {
    next(err);
  }
};
exports.handleKeywordCrawlerCtr = handleKeywordCrawlerCtr;
const handleKeywordProcessTrackingCtr = async (req, res, next) => {
  try {
    // Validate
    validateKeywordProcessTrackingInput(req);

    // Handle business logic
    const {
      trackingKey
    } = req.query;
    const data = await (0, _keyword.handleKeywordProcessTrackingSv)({
      trackingKey
    });
    res.status(200).json({
      status: 'SUCCESS',
      data: JSON.parse(data)
    });
  } catch (err) {
    next(err);
  }
};
exports.handleKeywordProcessTrackingCtr = handleKeywordProcessTrackingCtr;
const handleListKeywordCtr = async (req, res, next) => {
  try {
    // Handle validation
    validateListKeywordInput(req);
    const {
      userId
    } = res.locals.user;
    const {
      attributes: attributesQuery,
      limit,
      page
    } = req.query;
    let offset = 0;
    if (page) {
      offset = (page - 1) * limit;
    }
    let attributes = undefined;
    if (attributesQuery) {
      //TODO: Handle validate enum with Keyword column
      attributes = attributesQuery.split(',');
    }
    const listKeywords = await (0, _keyword.handleListKeywordSv)({
      userId,
      attributes,
      limit,
      offset
    });
    res.json({
      status: 'SUCCESS',
      data: listKeywords
    });
  } catch (err) {
    next(err);
  }
};
exports.handleListKeywordCtr = handleListKeywordCtr;
const validateKeywordCrawlerInput = req => {
  if (!req.body) {
    throw new Error('Missing body input');
  }
  _validator.validator.obj.required(req.body, 'listKeywords');
  const {
    listKeywords
  } = req.body;
  _validator.validator.array.minLen(listKeywords, 0);
  _validator.validator.array.maxLen(listKeywords, 100);
  _validator.validator.array.eachString(listKeywords);
};
const validateListKeywordInput = req => {
  const {
    limit,
    page
  } = req.query;
  _validator.validator.number.isNumber(limit, 'limit');
  _validator.validator.number.isNumber(page, 'offset');
};
const validateKeywordProcessTrackingInput = req => {
  _validator.validator.obj.required(req.query, 'trackingKey');
  const {
    trackingKey
  } = req.query;
  _validator.validator.string.isString(trackingKey, 'trackingKey');
};