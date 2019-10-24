"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stringify = exports.parse = void 0;

// Serializes and deserializes requests for caching.
var parse = function parse(input) {
  if (input === 'false') {
    return false;
  }

  if (input[0] === '{') {
    // Backward compatibility
    return JSON.parse(input);
  } // Defaults


  var res = {
    code: 200,
    headers: {},
    body: ''
  };
  var parts = input.split(/\r?\n\r?\n/);

  if (parts.length) {
    var firstCodeCode = parts[0].charCodeAt(0);

    if (firstCodeCode >= 49 && firstCodeCode <= 53) {
      // Between 1 and 5 inclusive
      res.code = parseInt(parts[0], 10);
      parts.shift();
    }
  }

  if (parts.length) {
    if (/^\S+:\s*\S+/.test(parts[0])) {
      parts[0].split(/\r?\n/).forEach(function (header) {
        var colon = header.indexOf(':');
        res.headers[header.substr(0, colon)] = header.substr(colon + 1).replace(/^\s+/, '');
      });
      parts.shift();
    }
  }

  if (parts.length) {
    res.body = parts.join('\n\n');
  }

  return res;
};

exports.parse = parse;

var stringify = function stringify(input) {
  var results = [];

  if (input.code) {
    results.push(input.code);
  }

  if (input.headers) {
    results.push(Object.keys(input.headers).map(function (key) {
      return "".concat(key, ": ").concat(input.headers[key]);
    }).join('\n'));
  }

  if (input.body) {
    if (typeof input.body !== 'string') {
      input.body = JSON.stringify(input.body);
    }

    results.push(input.body);
  }

  var result = results.join('\n\n');
  return result;
};
/*
200

Header: value
Header1: value

Body
*/


exports.stringify = stringify;