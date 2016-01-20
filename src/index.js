import express from 'express';
import favicon from 'serve-favicon';
import {join} from 'path';
import bodyParser from 'body-parser';
import xmlParser from 'express-xml-bodyparser';
import logger from 'morgan';
import config from 'config';

import mappings from './mappings';
import cache from './cache-middleware';
import mockproxy from './mock-proxy';

var appRoot = join(__dirname, '..');

/* Initialization */
var app = express();
app.use(favicon(join(appRoot, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());                 // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));           // to support URL-encoded bodies
app.use(xmlParser({explicitArray: false})); // to support XML
app.use(express.static(join(appRoot, 'public')));

// View engine setup
app.set('views', join(appRoot, 'views'));
app.set('view engine', 'jade');

/* Routing */
// GET home page
app.get('/', (req, res) => {
  res.render('index', { title: 'API Mocking Proxy Server', mappings: Array.from(mappings.mappings.values()) });
});

// Setup proxy middleware
app.use(mappings());
app.use(cache());
app.use(mockproxy());

module.exports = app;