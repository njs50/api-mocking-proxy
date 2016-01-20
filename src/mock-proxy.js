import request from 'request';
import config from 'config';
import Cacher from './response-cacher';
import * as appUtils from './app-utils';
import Q from 'q';

// Private functions
function success(res, options) {
  res.writeHead(options.code || 200, options.headers);
  res.write(options.body);
  res.end();
}
    
function error(res, err) {
  console.error('request failed: ' + err);
  res.writeHead(500, {"Content-Type": 'text/plain'});
  res.write('An error has occured, please review the logs.');
  res.end();
}

function createConf(req, mappings) {
  // remove a leading slash if there is any
  var reqUrl = req.url.startsWith('/') ? req.url.substr(1) : req.url;

  for (let [key, mapping] of mappings) {
    if (reqUrl.startsWith(key) || reqUrl.startsWith(mapping.host)) {
      return {
        key: key,
        dir: mapping.dir || key,
        host: mapping.host,
        matchHeaders: mapping.matchHeaders || false
      };
    }
  }
  throw new Error('No configuration found!');
}

export default class MockProxy {
    constructor(mappings) {
      this.mappings = mappings;
      this.cache = new Cacher();
      this.config = config.get('proxy');
    }
    
    execute(req, res) {
      let deferred = Q.defer(),
          conf = createConf(req, this.mappings);

      // There is a cached response
      if (this._loadCached(conf, req, res)) {
        deferred.resolve();
        return deferred.promise;
      }

      let handler = (err, retRes, body) => {
        if (!err && /^2\d\d$/.test(retRes.statusCode)) {
          var data = {
            code: retRes.statusCode,
            headers: retRes.headers,
            body: body
          };

          this.cache.set(conf, req, data).then(
            () => {
              success(res, data);
              deferred.resolve();
            },
            (err) => {
              error(res, err);
              deferred.reject(err);
            }
          );

        } else {
          error(res, err);
          deferred.reject(err);
        }
      };

      var hostUrl = conf.host + appUtils.stripApiKey(conf.key, req.url),
          method, urlConf;

      switch (req.method) {
        case 'GET':
        case 'DELETE':
          urlConf = {url: hostUrl, timeout: this.config.timeout};
          method = (req.method === 'GET') ? request : request.del;
          break;
        case 'POST':
        case 'PUT':
          urlConf = {url: hostUrl, form: req.body, timeout: this.config.timeout};
          method = (req.method === 'POST') ? request.post : request.put;
          break;
        default:
          deferred.reject(new Error('Invalid HTTP method: ' + req.method));
      }
      if (method) {
        method(urlConf, handler);
      }
      return deferred.promise;
    }
    
    _loadCached(conf, req, res) {
      var cached = false,
          data = this.cache.get(conf, req);

      if (data) {
        success(res, JSON.parse(data));
        cached = true;
      }
      return cached;
    }
}