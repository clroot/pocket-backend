import { Types } from 'mongoose';
import { Context } from 'koa';
import Joi from 'joi';
import httpStatus from 'http-status';
import { Article, Tag } from '../../models';
import { IArticleDocument } from '../../models/article';

const serializeArticle = (article: IArticleDocument | IArticleDocument[]) => {
  const extractTags = (tag) => tag.name;
  if (Array.isArray(article)) {
    return article.map((iter) => ({
      ...iter,
      tags: iter.tags.map(extractTags),
    }));
  }

  return { ...article, tags: article.tags.map(extractTags) };
};

export const getArticleById = async (ctx: Context, next: Function) => {
  const { id } = ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    ctx.status = httpStatus.BAD_REQUEST;
    return;
  }

  try {
    const article = (await Article.findById(id)
      .populate('tags', 'name')
      .exec()) as IArticleDocument;
    if (!article) {
      ctx.status = httpStatus.NOT_FOUND;
      return;
    }

    ctx.state.article = article;
    return next();
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

export const checkOwnArticle = (ctx: Context, next: Function) => {
  const {
    auth: { user },
    article,
  } = ctx.state;

  if (article.user.toString() !== user) {
    ctx.status = httpStatus.FORBIDDEN;
    return;
  }

  return next();
};

/**
 * POST /api/v1/article
 */
export const save = async (ctx: Context) => {
  const schema = Joi.object().keys({
    url: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = httpStatus.BAD_REQUEST;
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
    ctx.status = httpStatus.CREATED;
    ctx.body = article;
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * /api/v1/articles
 */
export const list = async (ctx: Context) => {
  const page = parseInt(ctx.query.page || '1', 10);
  if (page < 1) {
    ctx.status = httpStatus.BAD_REQUEST;
    return;
  }

  const { user } = ctx.state.auth;
  let { tag } = ctx.query;
  tag = tag ? await Tag.getIdByName({ user, name: tag }) : tag;

  const query = {
    user,
    ...(tag ? { tags: tag } : {}),
  };

  try {
    const articles = (await Article.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .lean()
      .populate('tags', 'name')
      .exec()) as IArticleDocument[];

    const articlesCount = await Article.countDocuments().exec();

    ctx.set('Last-Page', Math.ceil(articlesCount / 10).toString());
    ctx.body = serializeArticle(articles);
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * /api/v1/article/:id
 */
export const read = async (ctx: Context) => {
  ctx.body = ctx.state.article;
};

/**
 * DELETE /api/v1/article/:id
 */
export const remove = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    await Article.findByIdAndRemove(id).exec();
    ctx.status = httpStatus.NO_CONTENT;
    ctx.set('Removed-Article', id);
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * PATCH /api/v1/article/:id
 */
export const update = async (ctx: Context) => {
  const schema = Joi.object().keys({
    tags: Joi.array().items(Joi.string()),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = httpStatus.BAD_REQUEST;
    ctx.body = result.error;
    return;
  }

  const { id } = ctx.params;
  let { tags } = ctx.request.body;
  try {
    let article = (await Article.findById(id)) as IArticleDocument;
    if (!article) {
      ctx.status = httpStatus.NOT_FOUND;
      return;
    }
    await article.updateTagData(tags);

    article = await article.populate('tags', 'name').execPopulate();
    ctx.body = serializeArticle(article);
  } catch (error) {
    ctx.throw(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};
