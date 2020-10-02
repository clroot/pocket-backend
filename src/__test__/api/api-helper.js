import request from 'supertest';
import httpStatus from 'http-status';
import User from '../../models/user';

export const createUser = async (
  user = { email: '', username: '', password: '' },
  callback = undefined,
) => {
  const { email, username, password } = user;
  const record = new User({ email, username });
  await record.setPassword(password);
  await record.save();
  return callback ? callback() : Promise.resolve();
};

export const cleanUpUser = async (callback = undefined) => {
  await User.deleteMany({}).exec(callback);
  return callback ? callback() : Promise.resolve();
};

export const getAccessToken = async (
  server,
  user = { email: '', username: '', password: '' },
  callback = undefined,
) => {
  let accessToken;
  await request(server)
    .post('/api/v1/auth/login')
    .send(user)
    .expect(httpStatus.OK)
    .then((res) => {
      accessToken = res.headers['set-cookie'][0];
    });
  return callback ? callback(accessToken) : Promise.resolve(accessToken);
};
