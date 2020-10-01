require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import serve from 'koa-static';
import path from 'path';
import send from 'koa-send';

import Database from './database';
import api from './api';
import { consumeUser } from './lib/token';

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
app.use(async (ctx) => {
  if (ctx.status === 404 && ctx.path.indexOf('/api') !== 0) {
    await send(ctx, 'index.html', { root: buildDirectory });
  }
});

export const startServer = (port = PORT || 4000) => {
  return app.listen(port, () => {
    console.log(`Listening to port ${port}...`);
  });
};

export const closeServer = async (server) => {
  server.close();
  await Database.closeConnect();
};

export default app;
