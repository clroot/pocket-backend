//require('dotenv').config();
import Koa, { Context } from 'koa';
import { Server } from 'http';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import serve from 'koa-static';
import path from 'path';
import send from 'koa-send';
import getPort from 'get-port';

import loadVariable from './loadVariable';
import Database from './database';
import api from './api';
import { consumeUser } from './lib/token';

loadVariable();
const { PORT } = process.env;

const app = new Koa();
const router = new Router();

Database.connect();
router.use('/api/v1', api.routes());

app.use(logger());
app.use(bodyParser());
app.use(consumeUser);
app.use(router.routes()).use(router.allowedMethods());

const buildDirectory = path.resolve(__dirname, '../../frontend/build');
app.use(serve(buildDirectory));
app.use(async (ctx: Context) => {
  if (ctx.status === 404 && ctx.path.indexOf('/api') !== 0) {
    await send(ctx, 'index.html', { root: buildDirectory });
  }
});

export const startServer = async (
  port: number = parseInt(PORT || '4000'),
  callback?: Function,
) => {
  if (process.env.NODE_ENV === 'test') {
    port = await getPort({ port: getPort.makeRange(4001, 5000) });
  }

  const server = await app.listen(port, () => {
    console.log(`Listening to port ${port}...`);
  });

  callback && callback(undefined, server);
  return server;
};

export const closeServer = async (server: Server) => {
  server.close();
  await Database.closeConnect();
};

export default app;
