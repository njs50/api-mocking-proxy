import cacher from './cacher';
import {passthru} from './app-utils';

const middleware = () => (req, res, next) => {
  cacher.get(req).then((payload) => {
    if (!payload) {
      // Not in cache, keep on moving.
      return next();
    }
    passthru(res, payload);
  });
};

export default middleware;