import { Context } from 'koa';
import Joi from 'joi';
import httpStatus from 'http-status';
import axios from 'axios';
import qs from 'qs';
import { getApiHost, getAppHost, encodeBase64 } from '../../../lib/utils';
import { generateToken, decodeToken, setTokenCookie } from '../../../lib/token';
import { sendEmail, createAuthEmail } from '../../../lib/email';
import { User, SocialAccount, EmailAuth } from '../../../models';

/**
 * POST /api/v1/auth/social/register
 */
export const register = async (ctx: Context) => {
  const registerToken = ctx.cookies.get('register_token');
  if (!registerToken) {
    ctx.status = httpStatus.UNAUTHORIZED;
    return;
  }

  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    username: Joi.string().min(2).max(20).required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = httpStatus.BAD_REQUEST;
    ctx.body = result.error;
    return;
  }

  let decoded;
  try {
    decoded = decodeToken(registerToken) as {
      socialId: string;
      provider: string;
    };
  } catch (error) {
    console.error(error);
    ctx.status = httpStatus.UNAUTHORIZED;
    return;
  }
  try {
    const { email, username } = ctx.request.body;
    const { socialId, provider } = decoded;

    const isDuplicate = await User.checkDuplication({ email, username });
    if (isDuplicate) {
      let field;

      const isEmail = await User.findByEmail(email);
      if (isEmail) {
        field = 'email';
      } else {
        field = 'username';
      }

      ctx.body = { field };
      ctx.status = httpStatus.CONFLICT;
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

    //TODO: 코드 간소화
    const emailAuthToken = generateToken({ user: user.id });
    const emailAuth = new EmailAuth({ user: user.id, token: emailAuthToken });
    await emailAuth.save();
    await sendEmail({ to: email, ...createAuthEmail(emailAuthToken) });
  } catch (error) {
    console.error(error);
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * /api/v1/auth/social/login/kakao
 */
export const kakaoLogin = (ctx: Context) => {
  const host = getApiHost();
  const { KAKAO_REST_API_KEY } = process.env;

  const REDIRECT_URI = `${host}/api/v1/auth/social/callback/kakao`;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;

  ctx.redirect(kakaoAuthUrl);
};

/**
 * /api/v1/auth/social/callback/kakao
 */
export const kakaoCallback = async (ctx: Context, next: Function) => {
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

export const socialCallback = async (ctx: Context) => {
  const { socialId, provider, username } = ctx.state.oauth;
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

    return ctx.redirect(
      `${host}/social/register?info=${encodeBase64(
        JSON.stringify({ username }),
      )}`,
    );
  }

  try {
    const user = await User.findById(account.user);
    if (!user) {
      ctx.status = httpStatus.UNAUTHORIZED;
      return;
    }

    setTokenCookie(ctx, user.generateToken());

    const { username, id } = user;
    ctx.redirect(
      `${host}/?loginToken=${encodeBase64(JSON.stringify({ username, id }))}`,
    );
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};
