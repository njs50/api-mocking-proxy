import {parse} from 'url';
import querystring from 'querystring';
import {join, resolve, dirname} from 'path';

// Utility methods
function stripSpecialChars(val) {
  if (!val) {
    return val;
  }
  return val.replace(/\?/g, '--').replace(/\//g, '__').replace(/:/g, '~~').replace(/\*/g, '%2A');
}

function getUrlPath(urlParts) {
  if (!urlParts.pathname) {
    return '';
  }
  return stripSpecialChars(urlParts.pathname.replace('/', ''));
}

function getQueryString(urlPath, urlParts, req) {
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

function getReqHeaders(req, match) {
  let headers = '';
  if (Array.isArray(match)) {
    for (let header of match) {
      if (match in req.headers) {
        headers = join(headers, stripSpecialChars(header + '/' + req.headers[header]));
      }
    }
  } else {
    for (let key in req.headers) {
      headers = join(headers, stripSpecialChars(key + '/' + req.headers[key]));
    }
  }
  return headers;
}

export function resolveMockPath(req, dataRoot) {
  // Mock data directory associated with the API call
  var path = join(req.conf.dir, req.method);
  if (!path) {
    return null;
  }

  // Custom headers
  if (req.conf.matchHeaders) {
    const headers = getReqHeaders(req, req.conf.matchHeaders);
    if (headers) {
      path = join(path, headers);
    }
  }

  // Meta info regarding the request's url, including the query string
  var parts = parse(req.urlToProxy, true);

  if (parts) {
    // REST parameters
    var urlPath = getUrlPath(parts);
    if (urlPath) {
      path = join(path, urlPath);
    }

    // Query string
    var qs = getQueryString(urlPath, parts, req);
    if (qs) {
      path = (urlPath) ? path += qs : join(path, qs);
    }
  }

  return join(dataRoot, path + '.mock');
}

export function passthru(res, options) {
  res.writeHead(options.code || 200, options.headers);
  res.write(options.body);
  res.end();
}
    
export function errorHandler(res, err) {
  console.error('Request failed: ' + err);
  res.writeHead(500, {'Content-Type': 'text/plain'});
  res.write('An error has occured, please review the logs.');
  res.end();
}