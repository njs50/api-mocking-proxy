import qs from 'querystring';
import { shouldIgnore } from './app-utils';

const ct = (req) => (req.conf.contentType || req.headers['content-type']);

const middleware = () => (req, res, next) => {
  if (shouldIgnore(req)) {
    return next();
  }
  let bodyData = {};
  if (req.body) {
    const bodyStr = req.body.toString('utf8');
    
    try {
      if ('application/json' === ct(req)) {
        bodyData = JSON.parse(bodyStr);
      } else if ('application/x-www-form-urlencoded' === ct(req)) {
        bodyData = qs.parse(bodyStr);
      }
    } catch (e) { }
  }
  req.props = {
    ...req.query,
    ...bodyData
  };
  next();
};

export default middleware;