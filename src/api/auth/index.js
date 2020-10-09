import Router from 'koa-router';
import * as authCtrl from './auth.ctrl';
import social from './social';
import checkLoggedIn from '../../lib/checkLoggedIn';

const auth = new Router();

auth.post('/register', authCtrl.register);
auth.post('/login', authCtrl.login);
auth.get('/check', authCtrl.check);
auth.post('/logout', authCtrl.logout);
auth.post('/verify', checkLoggedIn, authCtrl.verify);

auth.use('/social', social.routes());

export default auth;
