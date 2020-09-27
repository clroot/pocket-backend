import Router from 'koa-router';
import {
  kakaoLogin,
  kakaoCallback,
  socialCallback,
  register,
} from './social.ctrl';

const social = new Router();

/* REGISTER & LOGIN */
social.post('/register', register);
social.get('/login/kakao', kakaoLogin);

/* Callback */
social.get('/callback/kakao', kakaoCallback, socialCallback);

export default social;
