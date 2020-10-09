import httpStatus from 'http-status';
import { encodeBase64 } from '../../lib/utils';
import User from '../../models/user';
import EmailAuth from '../../models/emailAuth';
import Tag from '../../models/tag';

/**
 * /api/v1/user/tags
 */
export const userTagList = async (ctx) => {
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
export const userTagRemove = async (ctx) => {
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
export const verify = async (ctx) => {
  const { token } = ctx.request.body;
  const { auth } = ctx.state;
  try {
    const emailAuth = await EmailAuth.findOne({ token });
    if (!emailAuth) {
      ctx.status = httpStatus.NOT_FOUND;
      return;
    }
    if (emailAuth.token !== token && emailAuth.user.toString() !== auth.user) {
      ctx.status = httpStatus.BAD_REQUEST;
      return;
    }
    await emailAuth.remove();

    const user = await User.findById(auth.user);
    user.setVerified();
    await user.updateOne().exec();

    ctx.body = {
      type: 'email-verified',
      status: true,
    };
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};
