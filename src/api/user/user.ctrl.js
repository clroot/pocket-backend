import Tag from '../../models/tag';
import { encodeBase64 } from '../../lib/utils';
import httpStatus from 'http-status';

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
    await Tag.findOneAndRemove({ user, name }).exec();

    ctx.status = httpStatus.NO_CONTENT;
    ctx.set('Removed-Tag', encodeBase64(name));
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};
