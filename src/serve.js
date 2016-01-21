import config from 'config';
import app from './index';

export default function () {
  const server = config.get('server');

  const port = server.port,
        host = server.host;
  console.log("Starting server: [http://%s:%s]", host, port);
  app.listen(port, host);
};