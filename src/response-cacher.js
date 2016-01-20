import * as fs from 'fs';
import filendir from 'filendir';
import * as appUtils from './app-utils';
import Q from 'q';
import config from 'config';
import {resolve, join} from 'path'

function readMock(mockPath) {
  return (fs.existsSync(mockPath)) ? fs.readFileSync(mockPath, 'utf8') : '';
}

export default class Cacher {
    constructor() {
      this.config = config.get('cache');
      let appRoot = join(__dirname, '..');
      this.dataRoot = resolve(appRoot, this.config.dataRoot || '');
    }
    
    get(conf, req) {
      return readMock(this._resolveMockPath(conf, req));
    }
    
    set(conf, req, data) {
      if (!data) {
        throw new Error("Invalid argument: data must be provided!");
      }
      var deferred = Q.defer(),
          mockPath = this._resolveMockPath(conf, req);
      filendir.wa(mockPath, JSON.stringify(data), err => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
        }
      });
      return deferred.promise;
    }
    
    _resolveMockPath(conf, req) {

      // Mock data directory associated with the API call
      var path = appUtils.getDataDir(conf, req);
      if (!path) {
        return null;
      }

      // Custom headers
      if (conf.matchHeaders) {
        var headers = appUtils.getReqHeaders(req);
        if (headers) {
          path = join(path, headers);
        }
      }

      // Meta info regarding the request's url, including the query string
      var parts = appUtils.getUrlParts(appUtils.stripApiKey(conf.key, req.url));

      if (parts) {
        // REST parameters
        var urlPath = appUtils.getUrlPath(parts);
        if (urlPath) {
          path = join(path, urlPath);
        }

        // Query string
        var qs = appUtils.getQueryString(urlPath, parts, req);
        if (qs) {
          path = (urlPath) ? path += qs : join(path, qs);
        }
      }

      return join(this._docRoot, path + '.mock');
    }
}