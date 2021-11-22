import dotenv from 'dotenv';
import getPort from 'get-port';
import app from './main';
import Database from './database';

dotenv.config();

export const startServer = async (
  port = process.env.PORT || 4000,
  callback = undefined,
) => {

  Database.connect()
  if (process.env.NODE_ENV === 'test') {
    port = await getPort({ port: getPort.makeRange(4001, 5000) });
  }

  console.log(`Server is starting on port ${port}`);
  const server = await app.listen(port);

  return callback ? callback(server) : Promise.resolve(server);
};

export const closeServer = async (server) => {
  server.close();
  await Database.closeConnect();
};
startServer().then(() => {
  console.log('Server is started successfully');
});