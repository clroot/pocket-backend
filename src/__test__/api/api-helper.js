import request from 'supertest';
import httpStatus from 'http-status';
import User from '../../models/user';
import Article from '../../models/article';

/* AUTH */
const testUserInfo = {
  email: 'pocket@clroot.io',
  username: 'clroot',
  password: 'password',
};

export const registerUser = async (
  payload = { ...testUserInfo },
  callback = undefined,
) => {
  const { email, username, password } = payload;
  const record = new User({ email, username });
  await record.setPassword(password);
  await record.save();

  return callback ? callback() : Promise.resolve();
};

export const removeUser = async (
  payload = { ...testUserInfo },
  callback = undefined,
) => {
  const { email } = payload;
  const user = await User.findByEmail(email);
  await User.deleteOne({ _id: user.id }).exec();

  return callback ? callback() : Promise.resolve();
};

export const getAccessTokenCookie = async (
  server,
  payload = { ...testUserInfo },
  callback = undefined,
) => {
  let accessTokenCookie;
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

  return callback
    ? callback(accessTokenCookie)
    : Promise.resolve(accessTokenCookie);
};

/* ARTICLE */
const testArticle = {
  url: 'https://github.com/clroot/pocket-backend',
  tags: [],
};

export const saveArticle = async (
  server,
  accessTokenCookie,
  payload = { ...testArticle },
  callback = undefined,
) => {
  const { body: article } = await request(server)
    .post('/api/v1/articles')
    .send(payload)
    .set('Cookie', accessTokenCookie)
    .expect(httpStatus.CREATED);
  return callback ? callback(article) : Promise.resolve(article);
};

export const updateArticle = async (
  server,
  accessTokenCookie,
  articleId,
  payload = { tags: [] },
  callback = undefined,
) => {
  const { body: article } = await request(server)
    .patch(`/api/v1/articles/${articleId}`)
    .send(payload)
    .set('Cookie', accessTokenCookie)
    .expect(httpStatus.OK);
  return callback ? callback(article) : Promise.resolve(article);
};

/* CLEAN UP DATABASE */
export const cleanUpUser = async (callback = undefined) => {
  await User.deleteMany({}).exec();
  return callback ? callback() : Promise.resolve();
};

export const cleanUpArticle = async (callback = undefined) => {
  await Article.deleteMany({}).exec();
  return callback ? callback() : Promise.resolve();
};
