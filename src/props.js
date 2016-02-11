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
      if (ct(req) === 'application/json') {
        bodyData = JSON.parse(bodyStr);
      } else if (ct(req) === 'application/x-www-form-urlencoded') {
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
