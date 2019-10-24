"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _config = _interopRequireDefault(require("config"));

var _index = _interopRequireDefault(require("./index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _default() {
  var server = _config["default"].has('server') ? _config["default"].get('server') : {};
  var port = server.port || 8088;
  var host = server.host || 'localhost';
  var ignoreSSL = server.ignoreSSL;

  if (ignoreSSL) {
    console.log('[WARNING] ignoring SSL certs, use with caution!');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  console.log('Starting server: [http://%s:%s]', host, port);

  _index["default"].listen(port, host);
}