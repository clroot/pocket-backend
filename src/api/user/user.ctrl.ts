import { Context } from 'koa';
import httpStatus from 'http-status';
import { encodeBase64 } from '../../lib/utils';
import { User, EmailAuth, Tag } from '../../models';
import { IUserDocument } from '../../models/user';
import { IEmailAuthDocument } from '../../models/emailAuth';

/**
 * /api/v1/user/tags
 */
export const userTagList = async (ctx: Context) => {
  const { user } = ctx.state.auth;

  try {
    const tags = await Tag.findByUser(user);
    ctx.body = tags.map((iter) => iter.name);
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
  return;
};

/**
 * DELETE /api/v1/user/tags/:id
 */
export const userTagRemove = async (ctx: Context) => {
  const { user } = ctx.state.auth;
  const { name } = ctx.params;

  try {
    const tag = await Tag.findOne({ user, name });
    if (!tag) {
      ctx.status = httpStatus.NOT_FOUND;
      return;
    }
    await Tag.deleteOne({ _id: tag.id }).exec();

    ctx.status = httpStatus.NO_CONTENT;
    ctx.set('Removed-Tag', encodeBase64(name));
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * POST /api/v1/user/verify
 */
export const verify = async (ctx: Context) => {
  const { token } = ctx.request.body;
  const { auth } = ctx.state;
  const type = 'email-verify';
  const response = (status: string) => ({ type, status });

  try {
    const user = (await User.findById(auth.user)) as IUserDocument;
    const emailAuth = (await EmailAuth.findOne({
      token,
    })) as IEmailAuthDocument;

    if (user.isVerified) {
      ctx.body = response('already-verified');
      return;
    }
    if (!emailAuth) {
      ctx.body = response('invalid-token');
      return;
    }
    if (emailAuth.token !== token && emailAuth.user.toString() !== auth.user) {
      ctx.body = response('invalid-token');
      return;
    }
    await emailAuth.remove();
    await user.setVerified();

    ctx.body = response('success');
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};
