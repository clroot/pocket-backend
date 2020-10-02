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
  user = { ...testUserInfo },
  callback = undefined,
) => {
  const { email, username, password } = user;
  const record = new User({ email, username });
  await record.setPassword(password);
  await record.save();

  return callback ? callback() : Promise.resolve();
};

export const removeUser = async (
  user = { ...testUserInfo },
  callback = undefined,
) => {
  const { email } = user;
  await User.findOneAndRemove({ email }).exec();

  return callback ? callback() : Promise.resolve();
};

export const getAccessToken = async (
  server,
  user = { ...testUserInfo },
  callback = undefined,
) => {
  let accessToken;
  try {
    await request(server)
      .post('/api/v1/auth/login')
      .send(user)
      .expect(httpStatus.OK)
      .then((res) => {
        accessToken = res.headers['set-cookie'][0];
      });
  } catch (error) {
    console.error(error);
  }

  return callback ? callback(accessToken) : Promise.resolve(accessToken);
};

/* ARTICLE */
const testArticle = {
  url: 'https://github.com/clroot/pocket-backend',
  tags: [],
};

export const saveArticle = async (
  server,
  accessToken,
  article = { ...testArticle },
  callback = undefined,
) => {
  const { body: articleObject } = await request(server)
    .post('/api/v1/articles')
    .send(article)
    .set('Cookie', accessToken)
    .expect(httpStatus.CREATED);
  return callback ? callback(articleObject) : Promise.resolve(articleObject);
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
