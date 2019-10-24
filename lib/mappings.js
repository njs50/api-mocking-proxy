"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(require("config"));

var _appUtils = require("./app-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var mappings = _config["default"].has('mappings') ? _config["default"].get('mappings') : {};
var mapmap = new Map();
Object.keys(mappings).forEach(function (key) {
  return mapmap.set(key, _objectSpread({
    key: key
  }, mappings[key]));
});

var middleware = function middleware() {
  return function (req, res, next) {
    if ((0, _appUtils.shouldIgnore)(req)) {
      return next();
    } // remove a leading slash if there is any


    var reqUrl = req.url.startsWith('/') ? req.url.substr(1) : req.url;
    var key = reqUrl.split('/')[0];

    if (mappings.has(key)) {
      var mapping = mappings.get(key);
      var conf = {
        key: key,
        dir: mapping.dir || key,
        host: mapping.host,
        matchHeaders: mapping.matchHeaders || false,
        matchProps: mapping.matchProps === false ? false : mapping.matchProps || true,
        ignoreProps: mapping.ignoreProps,
        contentType: mapping.contentType,
        noproxy: mapping.noproxy,
        nocache: mapping.nocache,
        touchFiles: mapping.touchFiles,
        delay: mapping.delay
      };
      req.conf = conf;
      req.urlToProxy = reqUrl.replace(key, '');
      return next();
    }

    console.log('WARN: No mapping found for ' + key);
    res.writeHead(404, {
      'Content-Type': 'text/plain'
    });
    res.write('No proxy mapping found for this URL.');
    res.end();
  };
};

middleware.mappings = mapmap;
middleware.bodyParserConfig = {
  type: function type(req) {
    return !(0, _appUtils.shouldIgnore)(req);
  }
};
var _default = middleware;
exports["default"] = _default;