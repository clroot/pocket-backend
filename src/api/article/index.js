import Router from 'koa-router';

import * as articleCtrl from './article.ctrl.js';
import checkLoggedIn from '../../lib/checkLoggedIn';

const articles = new Router();

articles.get('/', articleCtrl.list);
articles.post('/', checkLoggedIn, articleCtrl.save);

const article = new Router();
article.get('/', articleCtrl.read);
article.delete(
  '/',
  checkLoggedIn,
  articleCtrl.checkOwnArticle,
  articleCtrl.remove,
);
article.patch(
  '/',
  checkLoggedIn,
  articleCtrl.checkOwnArticle,
  articleCtrl.update,
);

articles.use('/:id', articleCtrl.getArticleById, article.routes());

export default articles;
