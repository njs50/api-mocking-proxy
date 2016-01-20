import urlModule from 'url';
import querystring from 'querystring';
import {join, resolve} from 'path';

// Utility methods
export function stripApiKey(key, url) {
  key = '/' + key;
  if (url.startsWith(key)) {
    url = url.replace(key, '');
  }
  return url;
}

export function getUrlParts(url) {
  return urlModule.parse(url, true);
}

export function stripSpecialChars(val) {
  if (!val) {
    return val;
  }
  return val.replace(/\?/g, '--').replace(/\//g, '__').replace(/:/g, '~~').replace(/\*/g, '%2A');
}

export function getUrlPath(urlParts) {
  if (!urlParts.pathname) {
    return '';
  }
  return stripSpecialChars(urlParts.pathname.replace('/', ''));
}

export function getQueryString(urlPath, urlParts, req) {
  /*
  * How the query string (QS) is obtained depends on HTTP method and URL path. Example:
  *
  * #1 URL path exists - append the QS as part of the file name
  *
  *   The leading '?' will be preserved to give a visual aid on how the path looked like.
  *
  *   GET http://localhost:8088/myapi/hello?a=b&c=d
  *   -> myapi/GET/hello--a=b&c=d.mock
  *
  * #2 No URL path - create a new file out of the QS itself
  *
  *   The leading '?' will be removed in order to keep the filename as short as possible.
  *   GET http://localhost:8088/myapi?a=b&c=d
  *   -> myapi/GET/a=b&c=d.mock
  *
  * Another factor is GET vs non-GET (POST or PUT in practice). In case we are not dealing
  * with a GET method, the QS will be pulled from request's body. It is assumed that the body
  * is URL-encoded.
  */
  var qs;
  if ((req.method === 'GET')) {
    qs = urlParts.search || '';
    if (!urlPath && qs.startsWith('?')) {
      qs = qs.replace('?', '');
    }
  } else {
    qs = querystring.stringify(req.body);
    if (qs && urlPath) {
      qs = '?' + qs;
    }
  }
  return stripSpecialChars(qs);
}

export function getReqHeaders(req) {
  var headers = '';
  for (var key in req.headers) {
    headers = join(headers, stripSpecialChars(key + '/' + req.headers[key]));
  }
  return headers;
}

export function getDataDir(conf, req) {
  return join(conf.dir, req.method);
}

export function getAbsPath(dir) {
  return resolve(dir);
}