import {resolveMockPath} from './app-utils';
import * as file from './files';
import config from 'config';
import {resolve, join} from 'path'

const cacheConfig = config.get('cache');
const appRoot = join(__dirname, '..');
const dataRoot = resolve(appRoot, cacheConfig.dataRoot || '');

class Cacher {
  get(req) {
    return file.read(resolveMockPath(req, dataRoot)).then(JSON.parse);
  }
  
  set(req, data) {
    if (!data) {
      return Promise.reject('Invalid argument: data must be provided!');
    }
    var mockPath = resolveMockPath(req, dataRoot);
    return file.write(mockPath, JSON.stringify(data));
  }
}

export default new Cacher();
