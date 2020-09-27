import Tag from '../../models/tag';

/**
 * /api/v1/user/tags
 */
export const userTagList = async (ctx) => {
  const { user } = ctx.state.auth;
  const tags = await Tag.findByUser(user);
  ctx.body = tags.map((iter) => iter.name);
  return;
};
