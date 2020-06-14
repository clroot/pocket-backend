import Router from 'koa-router';

import article from './article';

const api = new Router();

api.use('/articles', article.routes());

export default api;
