import Router from 'koa-router';

import * as articleCtrl from './article.ctrl.js';

const articles = new Router();

articles.get('/', articleCtrl.list);
articles.post('/', articleCtrl.write);

const article = new Router();
article.get('/', articleCtrl.read);
article.delete('/', articleCtrl.remove);
article.patch('/', articleCtrl.update);

articles.use('/:id', articleCtrl.checkObjectId, article.routes());

export default articles;
