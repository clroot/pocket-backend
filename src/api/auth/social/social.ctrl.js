import Joi from '@hapi/joi';
import axios from 'axios';
import qs from 'qs';
import { getApiHost, getAppHost, encodeBase64 } from '../../../lib/utils';
import { generateToken, decodeToken, setTokenCookie } from '../../../lib/token';
import SocialAccount from '../../../models/socialAccount';
import User from '../../../models/user';

/**
 * POST /api/v1/auth/social/register
 */
export const register = async (ctx) => {
  const registerToken = ctx.cookies.get('register_token');
  if (!registerToken) {
    ctx.status = 401;
    return;
  }

  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(20).required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
  }

  let decoded;
  try {
    decoded = decodeToken(registerToken);
  } catch (error) {
    console.error(error);
    ctx.status = 401;
    return;
  }
  try {
    const { email, username } = ctx.request.body;
    const { socialId, provider } = decoded;

    const exists = await User.findByEmail(email);
    if (exists) {
      ctx.status = 409;
      return;
    }
    const user = new User({ email, username });
    await user.save();
    user.id;

    const account = new SocialAccount({
      provider,
      socialId,
      user: user.id,
    });
    await account.save();

    setTokenCookie(ctx, user.generateToken());
    ctx.body = user.serialize();
  } catch (error) {
    console.error(error);
    ctx.throw(500, error);
  }
};

/**
 * /api/v1/auth/social/login/kakao
 */
export const kakaoLogin = (ctx) => {
  const host = getApiHost();
  const { KAKAO_REST_API_KEY } = process.env;

  const REDIRECT_URI = `${host}/api/v1/auth/social/callback/kakao`;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;

  ctx.redirect(kakaoAuthUrl);
};

/**
 * /api/v1/auth/social/callback/kakao
 */
export const kakaoCallback = async (ctx, next) => {
  const { code: authorizeCode } = ctx.query;
  const { KAKAO_REST_API_KEY } = process.env;
  const host = getApiHost();

  const REDIRECT_URI = `${host}/api/v1/auth/social/callback/kakao`;

  const kakaoTokenResponse = await axios({
    method: 'POST',
    url: 'https://kauth.kakao.com/oauth/token',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify({
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: REDIRECT_URI,
      code: authorizeCode,
    }),
  });

  const { access_token } = kakaoTokenResponse.data;

  const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const {
    id: socialId,
    properties: { nickname: username, profile_image: profile },
  } = userResponse.data;

  ctx.state.oauth = { socialId, username, profile, provider: 'kakao' };
  return next();
};

export const socialCallback = async (ctx) => {
  const { socialId, provider } = ctx.state.oauth;
  const host = getAppHost();

  const account = await SocialAccount.findByOauthInfo(provider, socialId);
  if (!account) {
    const OAuthInfoToken = generateToken(
      { socialId, provider },
      { expiresIn: '30m' },
    );

    ctx.cookies.set('register_token', OAuthInfoToken, {
      maxAge: 1000 * 60 * 30,
      httpOnly: true,
    });

    return ctx.redirect(`${host}/social/register`);
  }

  try {
    const user = await User.findById(account.user);
    if (!user) {
      ctx.status = 401;
      return;
    }

    setTokenCookie(ctx, user.generateToken());

    const { username, id } = user;
    ctx.redirect(
      `${host}/?loginToken=${encodeBase64(JSON.stringify({ username, id }))}`,
    );
  } catch (error) {
    ctx.throw(500, error);
  }
};
