import request from 'supertest';
import chai, { assert, expect } from 'chai';
import chaiString from 'chai-string';
import httpStatus from 'http-status';
import { startServer, closeServer } from '../../main';

chai.use(chaiString);

describe('Authentication API', () => {
  const prefix = '/api/v1/auth';
  let server;

  const user = {
    email: 'clroot@kakao.com',
    username: 'clroot',
    password: 'password',
  };

  beforeAll(async () => {
    server = startServer(4001);
  });

  afterAll(async () => {
    await closeServer(server);
  });

  describe(`POST ${prefix}/register는 `, () => {
    const url = `${prefix}/register`;
    describe('성공시 ', () => {
      it('user 객체를 return한다. ', () =>
        request(server)
          .post(url)
          .send(user)
          .expect(httpStatus.CREATED)
          .then((res) => {
            const { username, _id } = res.body;
            assert.equal(username, user.username);
            assert.isString(_id);
          }));
    });
    describe('실패시 ', () => {
      it('email이 중복되면 409 CONFLICT', () =>
        request(server).post(url).send(user).expect(httpStatus.CONFLICT));
      it('field가 충족되지 않으면, 400 BAD_REQUEST', () =>
        request(server).post(url).send({}).expect(httpStatus.BAD_REQUEST));
    });
  });

  describe(`POST ${prefix}/login는 `, () => {
    const url = `${prefix}/login`;
    describe('성공시 ', () => {
      it('user 객체를 return한다.', () =>
        request(server)
          .post(url)
          .send(user)
          .expect(httpStatus.OK)
          .then((res) => {
            const { username, _id } = res.body;
            assert.equal(username, user.username);
            assert.isString(_id);
          }));
    });
    describe('실패시 ', () => {
      it('email이 존재하지 않으면, 404 NOT_FOUND', () =>
        request(server)
          .post(url)
          .send({ ...user, email: 'no-user@clroot.io' })
          .expect(httpStatus.NOT_FOUND));
      it('password가 일치하지 않으면, 401 UNAUTHORIZED', () =>
        request(server)
          .post(url)
          .send({ ...user, password: 'wrong-password' })
          .expect(httpStatus.UNAUTHORIZED));
      it('field가 충족되지 않으면, 400 BAD_REQUEST', () =>
        request(server).post(url).send({}).expect(httpStatus.BAD_REQUEST));
    });
  });

  describe(`GET ${prefix}/check는`, () => {
    const url = `${prefix}/check`;
    let accessTokenCookie;
    beforeAll((done) => {
      request(server)
        .post(`${prefix}/login`)
        .send(user)
        .then((res) => {
          accessTokenCookie = res.headers['set-cookie'];
          done();
        });
    });

    describe('성공시 ', () => {
      it('user 객체를 return한다. ', () =>
        request(server)
          .get(url)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.OK)
          .then((res) => {
            const { username, user: userId } = res.body;
            assert.isString(userId);
            assert.equal(username, user.username);
          }));
    });
  });

  describe(`POST ${prefix}/logout`, () => {
    const url = `${prefix}/logout`;

    describe('성공시 ', () => {
      it('access-token을 비운다. ', () =>
        request(server)
          .post(url)
          .expect(httpStatus.NO_CONTENT)
          .then((res) => {
            const setCookie = res.headers['set-cookie'][0];
            expect(setCookie).to.startWith('access_token=;');
          }));
    });
  });
});
