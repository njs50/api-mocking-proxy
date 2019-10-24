"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.read = read;
exports.write = write;

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _fs = require("fs");

var _path = require("path");

var _pify = _interopRequireDefault(require("pify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var writep = (0, _pify["default"])(_fs.writeFile);
var readp = (0, _pify["default"])(_fs.readFile);
var accessp = (0, _pify["default"])(_fs.access);
var mkdirpp = (0, _pify["default"])(_mkdirp["default"]);

function read(path) {
  return accessp(path, _fs.R_OK).then(function () {
    return readp(path, {
      encoding: 'utf8'
    });
  })["catch"](function () {
    return 'false';
  }).then(function (input) {
    return input || 'false';
  }); // Empty files are cache miss
}

function write(path, content) {
  return mkdirpp((0, _path.dirname)(path)).then(function () {
    return writep(path, content, {
      encoding: 'utf8',
      flag: 'w'
    });
  });
}