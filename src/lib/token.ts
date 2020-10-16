import jwt from 'jsonwebtoken';
import { Context } from 'koa';
import { User } from '../models/index.js';

const secretKey = process.env.JWT_SECRET || 'JWT_SECRET';

interface IAuthInfo {
  _id: string;
  username: string;
  exp: any;
}

export const generateToken = (
  payload: IAuthInfo | Object,
  options = { expiresIn: '7d' },
) => {
  const jwtOptions = {
    issuer: 'pocket.clroot.io',
    ...options,
  };

  return jwt.sign(payload, secretKey, jwtOptions);
};

export const decodeToken = (token: string): IAuthInfo | Object => {
  return jwt.verify(token, secretKey);
};

export const setTokenCookie = (
  ctx: Context,
  token: string,
  options = { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true },
) => {
  ctx.cookies.set('access_token', token, options);
};

export const consumeUser = async (ctx: Context, next: Function) => {
  const token = ctx.cookies.get('access_token');
  if (!token) return next();

  try {
    const decoded = decodeToken(token) as IAuthInfo;

    ctx.state.auth = {
      user: decoded._id,
      username: decoded.username,
    };

    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
      const user = await User.findById(decoded._id);
      const token = user.generateToken();

      setTokenCookie(ctx, token);
    }
    return next();
  } catch (error) {
    return next();
  }
};
