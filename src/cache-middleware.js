import cacher from './cacher';
import {passthru, shouldIgnore} from './app-utils';

const middleware = () => (req, res, next) => {
  if (shouldIgnore(req)) {
    return next();
  }
  cacher.get(req).then((payload) => {
    if (!payload) {
      // Not in cache, keep on moving.
      return next();
    }
    passthru(res, payload);
  }).catch(err => {
    console.log('Cache error', err);
    next();
  });
};

export default middleware;
