import request from 'supertest';
import { expect } from 'chai';
import httpStatus from 'http-status';

import app from '../../main';

console.log2 = console.log;
console.log = () => {};
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
  });

  describe('POST /api/v1/auth/register', () => {
    const url = `${prefix}/register`;
    it('should register a new user', () => {
      return request(server)
        .post(url)
        .send(user)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body.email).to.be.equal(user.email);
          expect(res.body.username).to.be.eq(user.username);
        });
    });
    it('should not register a user when email is already exist', () => {
      return request(server).post(url).send(user).expect(httpStatus.CONFLICT);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const url = `${prefix}/login`;

    it('should allow login when give correct user info', () => {
      return request(server)
        .post(url)
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.email).be.eq(user.email);
          expect(res.body.username).be.eq(user.username);
          expect(res.headers['set-cookie']).be.exist;
        });
    });

    it('should return Unauthorized when give wrong password', () => {
      return request(server)
        .post(url)
        .send({ ...user, password: 'wrong-password' })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe(`GET ${prefix}/check`, () => {
    const url = `${prefix}/check`;
    let accessTokenCookie;
    beforeAll(async () => {
      const res = await request(server).post(`${prefix}/login`).send(user);
      accessTokenCookie = res.headers['set-cookie'];
    });
    it('should returns login info when give valid access-token', () => {
      return request(server)
        .get(url)
        .set('Cookie', accessTokenCookie)
        .expect(httpStatus.OK);
    });
    it('should not returns login info when give invalid access-token', () => {
      return request(server).get(url).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe(`POST ${prefix}/logout`, () => {
    const url = `${prefix}/logout`;

    it('should returns 204 and remove access-token', () => {
      return request(server)
        .post(url)
        .expect(httpStatus.NO_CONTENT)
        .then((res) => {
          const setCookie = res.headers['set-cookie'];
          expect(setCookie).to.match(/access_token=;/);
        });
    });
  });
});
