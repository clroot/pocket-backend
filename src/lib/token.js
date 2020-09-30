import jwt from 'jsonwebtoken';
import User from '../models/user';

export const generateToken = (payload, options = { expiresIn: '7d' }) => {
  const jwtOptions = {
    issuer: 'pocket.clroot.io',
    expiresIn: '7d',
    ...options,
  };
  const secretKey = process.env.JWT_SECRET || 'JWT_SECRET';

  return jwt.sign(payload, secretKey, jwtOptions);
};

export const decodeToken = (token) => {
  const secretKey = process.env.JWT_SECRET;
  return jwt.verify(token, secretKey);
};

export const setTokenCookie = (
  ctx,
  token,
  options = { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true },
) => {
  ctx.cookies.set('access_token', token, options);
};

export const consumeUser = async (ctx, next) => {
  //TODO: access_token, refresh_token 분리
  const token = ctx.cookies.get('access_token');
  if (!token) return next();

  try {
    const decoded = decodeToken(token);

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
