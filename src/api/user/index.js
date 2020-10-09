import Router from 'koa-router';

import checkLoggedIn from '../../lib/checkLoggedIn';
import * as userCtrl from './user.ctrl.js';

const user = new Router();

user.get('/tags', checkLoggedIn, userCtrl.userTagList);
user.delete('/tags/:name', checkLoggedIn, userCtrl.userTagRemove);
user.post('/verify', checkLoggedIn, userCtrl.verify);

export default user;
