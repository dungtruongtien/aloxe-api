"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValidationError = exports.NotfoundError = exports.BusinessError = exports.AuthenticationError = void 0;
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}
exports.ValidationError = ValidationError;
class BusinessError extends Error {
  constructor(message, name = 'BusinessError') {
    super(message);
    this.name = name;
    this.status = 400;
  }
}
exports.BusinessError = BusinessError;
class NotfoundError extends Error {
  constructor(message, name = 'NotfoundError') {
    super(message);
    this.name = name;
    this.status = 404;
  }
}
exports.NotfoundError = NotfoundError;
class AuthenticationError extends Error {
  constructor(message, name = 'AuthenticationError') {
    super(message);
    this.name = name;
    this.status = 401;
  }
}
exports.AuthenticationError = AuthenticationError;