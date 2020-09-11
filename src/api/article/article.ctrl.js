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
    const article = await Article.findById(id);
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
  const { user, article } = ctx.state;
  if (article.user._id.toString() !== user._id) {
    ctx.status = 403;
    return;
  }

  return next();
};

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

  const article = new Article({
    url,
    tags,
    user: ctx.state.user._id,
  });

  try {
    await article.createMetaData();
    await article.generateTagData();
    await article.save();
    ctx.body = article;
  } catch (error) {
    ctx.throw(500, error);
  }
};

export const list = async (ctx) => {
  const page = parseInt(ctx.query.page || '1', 10);
  if (page < 1) {
    ctx.status = 400;
    return;
  }

  const { user } = ctx.state;
  const { tag } = ctx.query;

  const query = {
    user: user._id,
    ...(tag ? { tags: tag } : {}),
  };

  try {
    const articles = await Article.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .lean()
      .exec();

    const articlesCount = await Article.countDocuments().exec();

    ctx.set('Last-Page', Math.ceil(articlesCount / 10));
    ctx.body = articles;
  } catch (error) {
    ctx.throw(500, error);
  }
};

export const read = async (ctx) => {
  ctx.body = ctx.state.article;
};

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
  try {
    const article = await Article.findByIdAndUpdate(id, ctx.request.body, {
      new: true,
    }).exec();
    await article.createMetaData();
    await article.generateTagData();
    if (!article) {
      ctx.status = 404;
      return;
    }

    ctx.body = article;
  } catch (error) {
    ctx.throw(500, error);
  }
};
