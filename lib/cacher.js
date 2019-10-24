"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _appUtils = require("./app-utils");

var file = _interopRequireWildcard(require("./files"));

var _config = _interopRequireDefault(require("config"));

var _path = require("path");

var _touch = _interopRequireDefault(require("touch"));

var _pify = _interopRequireDefault(require("pify"));

var _cachePersist = require("./cache-persist");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var cacheConfig = _config["default"].has('cache') ? _config["default"].get('cache') : {};
var dataRoot = (0, _path.resolve)(cacheConfig.dataRoot || 'data');
var disabled = !!cacheConfig.disable;
var touchFiles = !!cacheConfig.touchFiles;
var touchp = (0, _pify["default"])(_touch["default"]);

var tap = function tap(fn) {
  for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    params[_key - 1] = arguments[_key];
  }

  return function (input) {
    return fn.apply(void 0, [input].concat(params)).then(function () {
      return input;
    });
  };
};

var doTouch = function doTouch(content, file, conf) {
  if (!content && (touchFiles || conf.touchFiles)) {
    return touchp(file);
  }

  return Promise.resolve(false);
};

var Cacher =
/*#__PURE__*/
function () {
  function Cacher() {
    _classCallCheck(this, Cacher);

    this.root = dataRoot;
  }

  _createClass(Cacher, [{
    key: "get",
    value: function get(req) {
      var mockFile = (0, _appUtils.resolveMockPath)(req, this.root);

      if (disabled || req.conf.nocache) {
        return doTouch(false, mockFile, req.conf);
      }

      return file.read(mockFile).then(_cachePersist.parse).then(tap(doTouch, mockFile, req.conf));
    }
  }, {
    key: "set",
    value: function set(req, data) {
      if (!data) {
        return Promise.reject(new Error('Invalid argument: data must be provided!'));
      }

      var mockPath = (0, _appUtils.resolveMockPath)(req, this.root);
      return file.write(mockPath, (0, _cachePersist.stringify)(data));
    }
  }]);

  return Cacher;
}();

var _default = new Cacher();

exports["default"] = _default;