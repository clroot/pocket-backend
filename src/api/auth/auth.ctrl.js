import Joi from 'joi';
import httpStatus from 'http-status';
import { User, EmailAuth } from '../../models';
import { setTokenCookie, generateToken } from '../../lib/token';
import { sendEmail, createAuthEmail } from '../../lib/email';

/**
 * POST /api/v1/auth/register
 */
export const register = async (ctx) => {
  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    username: Joi.string().min(2).max(20).required(),
    password: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = httpStatus.BAD_REQUEST;
    ctx.body = result.error;
    return;
  }

  const { email, username, password } = ctx.request.body;

  try {
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
    await user.setPassword(password);
    await user.save();

    ctx.status = httpStatus.CREATED;
    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });

    //TODO: 코드 간소화
    const emailAuthToken = generateToken({ user: user.id });
    const emailAuth = new EmailAuth({ user: user.id, token: emailAuthToken });
    await emailAuth.save();
    await sendEmail({ to: email, ...createAuthEmail(emailAuthToken) });
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * POST /api/v1/auth/login
 */
export const login = async (ctx) => {
  const { email, password } = ctx.request.body;
  if (!email || !password) {
    ctx.status = httpStatus.BAD_REQUEST;
    return;
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      ctx.status = httpStatus.NOT_FOUND;
      return;
    }

    const valid = await user.checkPassword(password);
    if (!valid) {
      ctx.status = httpStatus.UNAUTHORIZED;
      return;
    }

    ctx.body = user.serialize();

    const token = user.generateToken();
    setTokenCookie(ctx, token);
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * /api/v1/auth/check
 */
export const check = async (ctx) => {
  const { auth } = ctx.state;
  if (!auth) {
    ctx.status = httpStatus.UNAUTHORIZED;
    return;
  }

  ctx.body = auth;
};

/**
 * POST /api/v1/auth/logout
 */
export const logout = async (ctx) => {
  ctx.cookies.set('access_token');
  ctx.status = httpStatus.NO_CONTENT;
};
