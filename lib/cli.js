"use strict";

var _minimist = _interopRequireDefault(require("minimist"));

var _cacher = _interopRequireDefault(require("./cacher"));

var _serve = _interopRequireDefault(require("./serve"));

var _config = _interopRequireDefault(require("config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* globals process */
var argv = (0, _minimist["default"])(process.argv.slice(2), {
  alias: {
    root: ['r', 'data']
  }
});

if (argv.root) {
  _cacher["default"].root = argv.root;
}

if (!_config["default"].has('mappings')) {
  console.log('You have no proxy mappings defined... create a default.toml file.');
  process.exit(0);
}

(0, _serve["default"])();