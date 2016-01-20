import express from 'express';
import favicon from 'serve-favicon';
import {join} from 'path';
import bodyParser from 'body-parser';
import xmlParser from 'express-xml-bodyparser';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import MockProxy from './mock-proxy';
import config from 'config';
import mappings from './mappings';

var appRoot = join(__dirname, '..');

/* Initialization */
var app = express();
app.use(favicon(join(appRoot, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());                 // to support JSON-encoded bodies
app.use(bodyParser.urlencoded());           // to support URL-encoded bodies
app.use(xmlParser({explicitArray: false})); // to support XML
app.use(cookieParser());
app.use(express.static(join(appRoot, 'public')));

// View engine setup
app.set('views', join(appRoot, 'views'));
app.set('view engine', 'jade');

// Mock server initialization
const proxy = new MockProxy(mappings);

/* Routing */
// GET home page
app.get('/', (req, res) => {
  res.render('index', { title: 'API Mocking Proxy Server', mappings: Array.from(mappings.values()) });
});

// Proxied http methods
var supportedMethods = ['get', 'post', 'put', 'delete'];

for (var key of mappings.keys()) {
  let mappedUrl = '/' + key + '*';
  // API calls are delegated to the mock server
  supportedMethods.forEach(method => app[method](mappedUrl, ::proxy.execute));
}

module.exports = app;