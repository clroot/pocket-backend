import { Server } from 'http';
import { Model } from 'mongoose';
import request from 'supertest';
import httpStatus from 'http-status';
import { generateToken } from '../../lib/token';
import {
  EmailAuth,
  User,
  IArticleDocument,
  IEmailAuthDocument,
} from '../../models';

/* AUTH */
interface IUserPayload {
  email: string;
  username: string;
  password: string;
}
export const testUserInfo: IUserPayload = {
  email: 'clroot@kakao.com',
  username: 'clroot',
  password: 'password',
};

export const registerUser = async (
  payload: IUserPayload = { ...testUserInfo },
  callback?: Function,
) => {
  const { email, username, password } = { ...testUserInfo, ...payload };
  const record = new User({ email, username });
  await record.setPassword(password);
  await record.save();

  const emailAuth = new EmailAuth({
    token: generateToken({ email }),
    user: record.id,
  });
  await emailAuth.save();

  callback && callback(undefined, record);
  return record;
};

export const removeUser = async (
  payload: IUserPayload = { ...testUserInfo },
  callback?: Function,
) => {
  const { email } = payload;
  const user = await User.findByEmail(email);
  await User.deleteOne({ _id: user.id }).exec();

  callback && callback();
  return;
};

export const getAccessTokenCookie = async (
  server: Server,
  payload: IUserPayload = { ...testUserInfo },
  callback?: Function,
) => {
  let accessTokenCookie: string = '';
  try {
    await request(server)
      .post('/api/v1/auth/login')
      .send(payload)
      .expect(httpStatus.OK)
      .then((res) => {
        accessTokenCookie = res.headers['set-cookie'][0];
      });
  } catch (error) {
    console.error(error);
  }

  callback && callback(undefined, accessTokenCookie);
  return accessTokenCookie;
};

/* ARTICLE */
interface IArticlePayload {
  url?: string;
  tags: string[];
}
const testArticle: IArticlePayload = {
  url: 'https://github.com/clroot/pocket-backend',
  tags: [],
};

export const saveArticle = async (
  server: Server,
  accessTokenCookie: string,
  payload: IArticlePayload = { ...testArticle },
  callback?: Function,
) => {
  const { body: article }: { body: IArticleDocument } = await request(server)
    .post('/api/v1/articles')
    .send(payload)
    .set('Cookie', accessTokenCookie)
    .expect(httpStatus.CREATED);

  callback && callback(undefined, article);
  return article;
};

export const updateArticle = async (
  server: Server,
  accessTokenCookie: string,
  articleId: string,
  payload: IArticlePayload = { tags: [] },
  callback?: Function,
) => {
  const { body: article }: { body: IArticleDocument } = await request(server)
    .patch(`/api/v1/articles/${articleId}`)
    .send(payload)
    .set('Cookie', accessTokenCookie)
    .expect(httpStatus.OK);

  callback && callback(undefined, article);
  return article;
};

/* USER */
export const getEmailAuthToken = async (
  payload = { userId: '' },
  callback?: Function,
) => {
  const { userId } = payload;
  const emailAuth = (await EmailAuth.findOne({
    user: userId,
  })) as IEmailAuthDocument;
  const token = emailAuth.token;

  callback && callback(undefined, token);
  return token;
};

/* CLEAN UP DATABASE */
export const cleanUp = async (model: Model<any, any>, callback?: Function) => {
  try {
    await model.deleteMany({}).exec();
  } catch (error) {
    callback && callback(error);
    throw error;
  }
  callback && callback();
  return;
};
