"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cacher = _interopRequireDefault(require("./cacher"));

var _appUtils = require("./app-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var middleware = function middleware() {
  return function (req, res, next) {
    if ((0, _appUtils.shouldIgnore)(req)) {
      return next();
    }

    _cacher["default"].get(req).then(function (payload) {
      if (!payload) {
        // Not in cache, keep on moving.
        return next();
      }

      (0, _appUtils.passthru)(res, payload);
    })["catch"](function (err) {
      console.log('Cache error', err);
      next();
    });
  };
};

var _default = middleware;
exports["default"] = _default;