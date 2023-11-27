"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validator = void 0;
var _customError = require("../common/customError");
const validator = exports.validator = {
  number: {
    isNumber: (value, fieldName) => {
      if (value && isNaN(value)) {
        throw new _customError.ValidationError(`${fieldName} must be number`);
      }
      return true;
    }
  },
  string: {
    isString: (value, fieldName) => {
      if (value && typeof value !== 'string') {
        throw new _customError.ValidationError(`${fieldName} must be string`);
      }
      return true;
    },
    isEmail: value => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        throw new _customError.ValidationError('Email format is required');
      }
      return true;
    }
  },
  obj: {
    required: (obj, requiredField) => {
      if (!obj || !obj[requiredField]) {
        throw new _customError.ValidationError(`${requiredField} is required`);
      }
      return true;
    }
  },
  array: {
    minLen: (arr, minLen) => {
      if (arr.length < minLen) {
        throw new _customError.ValidationError(`Array must be greater than ${minLen}`);
      }
      return true;
    },
    maxLen: (arr, maxLen) => {
      if (arr.length > maxLen) {
        throw new _customError.ValidationError(`Array must be less than ${maxLen}`);
      }
      return true;
    },
    isArray: (value, fieldName) => {
      if (!Array.isArray(value)) {
        throw new _customError.ValidationError(`${fieldName} must be an array`);
      }
      return true;
    },
    eachString: arr => {
      if (arr) {
        for (let i = 0; i < arr.length; i++) {
          if (typeof arr[i] !== 'string') {
            throw new _customError.ValidationError('Each element in array must be string');
          }
        }
      }
      return true;
    }
  }
};