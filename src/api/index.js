import Router from 'koa-router';

import article from './article';
import auth from './auth';

const api = new Router();

api.use('/articles', article.routes());
api.use('/auth', auth.routes());

export default api;
