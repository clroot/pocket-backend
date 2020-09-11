import Router from 'koa-router';

import article from './article';
import auth from './auth';
import user from './user';

const api = new Router();

api.use('/articles', article.routes());
api.use('/auth', auth.routes());
api.use('/user', user.routes());

export default api;
