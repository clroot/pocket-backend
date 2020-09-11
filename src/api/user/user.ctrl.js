import Tag from '../../models/tag';

export const getUserTagList = async (ctx) => {
  const { user } = ctx.state.auth;
  const tags = await Tag.findByUser(user);
  ctx.body = tags.map((iter) => iter.name);
  return;
};
