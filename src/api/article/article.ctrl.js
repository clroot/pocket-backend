import mongoose from 'mongoose';
import Joi from '@hapi/joi';
import Article from '../../models/article';

const { ObjectId } = mongoose.Types;

export const getArticleById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }

  try {
    const article = await Article.findById(id).populate('tags', 'name').exec();
    if (!article) {
      ctx.status = 404;
      return;
    }

    ctx.state.article = article;
    return next();
  } catch (error) {
    ctx.throw(500, error);
  }
};

export const checkOwnArticle = (ctx, next) => {
  const {
    auth: { user },
    article,
  } = ctx.state;

  if (article.user.toString() !== user) {
    ctx.status = 403;
    return;
  }

  return next();
};

/**
 * POST /api/v1/article
 */
export const save = async (ctx) => {
  const schema = Joi.object().keys({
    url: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { url, tags } = ctx.request.body;
  const { user } = ctx.state.auth;

  const article = new Article({
    url,
    tags,
    user,
  });

  try {
    await article.createMetaData();
    ctx.body = article;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/**
 * /api/v1/article
 */
export const list = async (ctx) => {
  const page = parseInt(ctx.query.page || '1', 10);
  if (page < 1) {
    ctx.status = 400;
    return;
  }

  const { user } = ctx.state.auth;
  const { tag } = ctx.query;

  const query = {
    user,
    ...(tag ? { tags: tag } : {}),
  };

  try {
    const articles = await Article.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .lean()
      .populate('tags', 'name')
      .exec();

    const articlesCount = await Article.countDocuments().exec();

    ctx.set('Last-Page', Math.ceil(articlesCount / 10));
    ctx.body = articles;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/**
 * /api/v1/article/:id
 */
export const read = async (ctx) => {
  ctx.body = ctx.state.article;
};

/**
 * DELETE /api/v1/article/:id
 */
export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Article.findByIdAndRemove(id).exec();
    ctx.status = 204;
    ctx.set('Removed-Article', id);
  } catch (error) {
    ctx.throw(500, error);
  }
};

/**
 * PATCH /api/v1/article/:id
 */
export const update = async (ctx) => {
  const schema = Joi.object().keys({
    tags: Joi.array().items(Joi.string()),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { id } = ctx.params;
  let { tags } = ctx.request.body;
  try {
    const article = await Article.findById(id);
    if (!article) {
      ctx.status = 404;
      return;
    }
    await article.updateTagData(tags);

    ctx.body = await article.populate('tags', 'name').execPopulate();
  } catch (error) {
    ctx.throw(500, error);
  }
};
