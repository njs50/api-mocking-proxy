"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _request = _interopRequireDefault(require("request"));

var _pify = _interopRequireDefault(require("pify"));

var _typeIs = require("type-is");

var _config = _interopRequireDefault(require("config"));

var _cacher = _interopRequireDefault(require("./cacher"));

var _appUtils = require("./app-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var proxyConfig = _config["default"].has('proxy') ? _config["default"].get('proxy') : {};
var timeout = proxyConfig.timeout || 5000;
var disabled = !!proxyConfig.disable; // Add OPTIONS convenience wrapper

_request["default"].options = function (opts, callback) {
  opts.method = 'OPTIONS';
  return (0, _request["default"])(opts, callback);
};

var requestp = (0, _pify["default"])(_request["default"], {
  multiArgs: true
});

var eh = function eh(res) {
  return function (err) {
    return (0, _appUtils.errorHandler)(res, err);
  };
};

var responseHandler = function responseHandler(req, res) {
  return function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        retRes = _ref2[0],
        body = _ref2[1];

    var data = {
      code: retRes.statusCode,
      headers: retRes.headers,
      body: body
    };

    _cacher["default"].set(req, data).then(function () {
      return (0, _appUtils.passthru)(res, data);
    }, eh(res));
  };
};

var middleware = function middleware() {
  return function (req, res, next) {
    if ((0, _appUtils.shouldIgnore)(req)) {
      return next();
    }

    if (disabled || req.conf.noproxy) {
      res.writeHead(204);
      res.end();
      return;
    }

    var url = req.conf.host + req.urlToProxy;
    var method = req.method.toLowerCase();
    var urlConf = {
      url: url,
      timeout: timeout,
      headers: req.headers
    };

    if (urlConf.headers['accept-encoding'] && urlConf.headers['accept-encoding'].indexOf('gzip') !== -1) {
      urlConf.gzip = true;
    } // Remove encoding because we've processed the body already.


    delete urlConf.headers['content-encoding']; // Reset host

    delete urlConf.headers.host;

    if ((0, _typeIs.hasBody)(req)) {
      urlConf.body = req.body;
    }

    requestp[method](urlConf).then(responseHandler(req, res));
  };
};

var _default = middleware;
exports["default"] = _default;