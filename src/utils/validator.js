import { ValidationError } from "../common/customError";

export const validator = {
  number: {
    isNumber: (value, fieldName) => {
      if (value && isNaN(value)) {
        throw new ValidationError(`${fieldName} must be number`);
      }
      return true;
    },
  },
  string: {
    isString: (value, fieldName) => {
      if (value && typeof value !== 'string') {
        throw new ValidationError(`${fieldName} must be string`);
      }
      return true;
    },
    isEmail: (value) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        throw new ValidationError('Email format is required');
      }
      return true;
    }
  },
  obj: {
    required: (obj, requiredField) => {
      if (!obj || !obj[requiredField]) {
        throw new ValidationError(`${requiredField} is required`);
      }
      return true;
    }
  },
  array: {
    minLen: (arr, minLen) => {
      if (arr.length < minLen) {
        throw new ValidationError(`Array must be greater than ${minLen}`);
      }
      return true;
    },
    maxLen: (arr, maxLen) => {
      if (arr.length > maxLen) {
        throw new ValidationError(`Array must be less than ${maxLen}`);
      }
      return true;
    },
    isArray: (value, fieldName) => {
      if(!Array.isArray(value)) {
        throw new ValidationError(`${fieldName} must be an array`);
      }
      return true;
    },
    eachString: (arr) => {
      if (arr) {
        for (let i = 0; i < arr.length; i++) {
          if (typeof arr[i] !== 'string') {
            throw new ValidationError('Each element in array must be string');
          }
        }
      }
      return true;
    }
  }
}