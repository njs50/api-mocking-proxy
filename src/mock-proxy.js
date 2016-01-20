import request from 'request';
import pify from 'pify';
import config from 'config';
import cacher from './cacher';
import {passthru, errorHandler} from './app-utils';

const proxyConfig = config.get('proxy');
const timeout = proxyConfig.timeout || 5000;

const requestp = pify(request, {multiArgs: true});

const eh = (res) => (err) => errorHandler(res, err);

const responseHandler = (req, res) => ([retRes, body]) => {
  var data = {
    code: retRes.statusCode,
    headers: retRes.headers,
    body: body
  };

  cacher.set(req, data).then(() => passthru(res, data), eh(res));
};


const middleware = () => (req, res, next) => {
  const url = req.conf.host + req.urlToProxy,
        method = req.method.toLowerCase(),
        urlConf = {url, timeout};

  if (req.body) {
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      urlConf.form = req.body;
    } else {
      // default to JSON
      urlConf.json = true;
      urlConf.body = req.body;
    }
  }
  requestp[method](urlConf).then(responseHandler(req, res));
}

export default middleware;