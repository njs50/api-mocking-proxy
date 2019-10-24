"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _querystring = _interopRequireDefault(require("querystring"));

var _appUtils = require("./app-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ct = function ct(req) {
  return req.conf.contentType || req.headers['content-type'];
};

var middleware = function middleware() {
  return function (req, res, next) {
    if ((0, _appUtils.shouldIgnore)(req)) {
      return next();
    }

    var bodyData = {};

    if (req.body) {
      var bodyStr = req.body.toString('utf8');

      try {
        if (ct(req) === 'application/json') {
          bodyData = JSON.parse(bodyStr);
        } else if (ct(req) === 'application/x-www-form-urlencoded') {
          bodyData = _querystring["default"].parse(bodyStr);
        }
      } catch (e) {}
    }

    req.props = _objectSpread({}, req.query, {}, bodyData);
    next();
  };
};

var _default = middleware;
exports["default"] = _default;