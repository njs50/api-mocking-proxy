import config from 'config';

const mappings = config.get('mappings');

const mapmap = new Map();

Object.keys(mappings).forEach(key => mapmap.set(key, { key, ...mappings[key] }));

export default mapmap;