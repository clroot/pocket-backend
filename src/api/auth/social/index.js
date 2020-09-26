import Router from 'koa-router';
import * as socialCtrl from './social.ctrl';

const social = new Router();

social.get('/login/kakao', socialCtrl.kakaoLogin);
social.get('/callback/kakao', socialCtrl.kakaoCallback);

export default social;
