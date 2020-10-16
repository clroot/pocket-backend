import Router from 'koa-router';
import * as authCtrl from './auth.ctrl';
import social from './social';

const auth = new Router();

auth.post('/register', authCtrl.register);
auth.post('/login', authCtrl.login);
auth.get('/check', authCtrl.check);
auth.post('/logout', authCtrl.logout);

auth.use('/social', social.routes());

export default auth;
