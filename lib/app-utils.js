"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shouldIgnore = shouldIgnore;
exports.resolveMockPath = resolveMockPath;
exports.passthru = passthru;
exports.errorHandler = errorHandler;

var _url = require("url");

var _querystring = _interopRequireDefault(require("querystring"));

var _path = require("path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Utility methods
function stripSpecialChars(val) {
  if (!val) {
    return val;
  }

  return val.replace(/\?/g, '--').replace(/\//g, '__').replace(/:/g, '~~').replace(/\*/g, '%2A');
}

function getUrlPath(urlParts) {
  return stripSpecialChars((urlParts.pathname || '').replace('/', ''));
}

function getProps(req, match, ignore) {
  var qs;
  var pobj = {};

  if (Array.isArray(match)) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = match[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var m = _step.value;

        if (m in req.props) {
          pobj[m] = req.props[m];
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  } else if (match !== false) {
    pobj = req.props;
  }

  if (Array.isArray(ignore)) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = ignore[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var p = _step2.value;
        delete pobj[p];
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
          _iterator2["return"]();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  qs = _querystring["default"].stringify(pobj);
  return stripSpecialChars(qs);
}

function getReqHeaders(req, match) {
  var headers = '';

  if (Array.isArray(match)) {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = match[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var header = _step3.value;
        var presenseOnly = false;

        if (header.startsWith('@')) {
          presenseOnly = true;
          header = header.substring(1);
        }

        if (header in req.headers) {
          if (presenseOnly) {
            headers = (0, _path.join)(headers, stripSpecialChars(header));
          } else {
            headers = (0, _path.join)(headers, stripSpecialChars(header + '/' + req.headers[header]));
          }
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
          _iterator3["return"]();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  } else {
    for (var key in req.headers) {
      headers = (0, _path.join)(headers, stripSpecialChars(key + '/' + req.headers[key]));
    }
  }

  return headers;
}

function shouldIgnore(_ref) {
  var url = _ref.url;
  return url === '' || url === '/' || url.startsWith('/__');
}

function resolveMockPath(req, dataRoot) {
  // Mock data directory associated with the API call
  var path = (0, _path.join)(req.conf.dir, req.method);

  if (!path) {
    return null;
  } // Custom headers


  if (req.conf.matchHeaders) {
    var headers = getReqHeaders(req, req.conf.matchHeaders);

    if (headers) {
      path = (0, _path.join)(path, headers);
    }
  } // Meta info regarding the request's url, including the query string


  var parts = (0, _url.parse)(req.urlToProxy, true);

  if (parts) {
    // REST parameters
    var urlPath = getUrlPath(parts);

    if (urlPath) {
      path = (0, _path.join)(path, urlPath);
    } else {
      path = (0, _path.join)(path, 'index');
    } // Query string


    var props = getProps(req, req.conf.matchProps, req.conf.ignoreProps);

    if (props) {
      path = (0, _path.join)(path, props);
    }
  }

  path = (0, _path.join)(dataRoot, path + '.mock');
  console.log(path);
  return path;
}

function passthru(res, options) {
  var zlib = require('zlib');

  try {
    if (options.headers['content-encoding'] && options.headers['content-encoding'] === 'gzip') {
      zlib.gzip(options.body, function (_, result) {
        options.body = result;
        options.headers['content-length'] = result.length;
        res.writeHead(options.code || 200, options.headers);
        res.end(options.body);
      });
    } else {
      res.writeHead(options.code || 200, options.headers);
      res.write(options.body);
      res.end();
    }
  } catch (e) {
    console.warn('Error writing response', e);
    res.writeHead(options.code || 200, options.headers);
    res.end();
  }
}

function errorHandler(res, err) {
  console.error('Request failed: ' + err);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.write('An error has occured, please review the logs.');
  res.end();
}