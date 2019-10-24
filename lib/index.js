"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _serveFavicon = _interopRequireDefault(require("serve-favicon"));

var _path = require("path");

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _mappings = _interopRequireDefault(require("./mappings"));

var _props = _interopRequireDefault(require("./props"));

var _cacheMiddleware = _interopRequireDefault(require("./cache-middleware"));

var _mockProxy = _interopRequireDefault(require("./mock-proxy"));

var _delayMiddleware = _interopRequireDefault(require("./delay-middleware"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var appRoot = (0, _path.join)(__dirname, '..'); // Initialization

var app = (0, _express["default"])();
app.use((0, _serveFavicon["default"])((0, _path.join)(appRoot, 'public', 'favicon.ico')));
app.use((0, _morgan["default"])('dev'));
app.use(_bodyParser["default"].raw(_mappings["default"].bodyParserConfig)); // Setup proxy middleware

app.use((0, _mappings["default"])());
app.use((0, _delayMiddleware["default"])());
app.use((0, _props["default"])());
app.use((0, _cacheMiddleware["default"])());
app.use((0, _mockProxy["default"])());
app.use(_bodyParser["default"].json());
app.use(_express["default"]["static"]((0, _path.join)(appRoot, 'public'))); // View engine setup

app.set('views', (0, _path.join)(appRoot, 'views'));
app.set('view engine', 'ejs');
/* Routing */
// GET home page

app.get('/', function (req, res) {
  res.render('index', {
    title: 'API Mocking Proxy Server',
    mappings: Array.from(_mappings["default"].mappings.values())
  });
});
var _default = app;
exports["default"] = _default;