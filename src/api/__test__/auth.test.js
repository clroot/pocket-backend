import httpStatus from 'http-status';
import request from 'supertest';
import { expect } from 'chai';
import app from '../../main';
import User from '../../models/user';

describe('Authentication API', () => {
  const prefix = '/api/v1/auth';
  let server;
  let user;

  beforeAll(async () => {
    user = {
      email: 'clroot@kakao.com',
      username: 'clroot',
      password: 'password',
    };

    server = app.listen(4002, () => {});
  });

  afterAll(async () => {
    server.close();
    await User.findOneAndRemove({ email: user.email });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', () => {
      return request(server)
        .post(`${prefix}/register`)
        .send(user)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body.email).to.be.equal(user.email);
          expect(res.body.username).to.be.eq(user.username);
        });
    });
  });
});
