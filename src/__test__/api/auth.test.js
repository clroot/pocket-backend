import request from 'supertest';
import chai, { assert, expect } from 'chai';
import chaiString from 'chai-string';
import sinon from 'sinon';
import httpStatus from 'http-status';
import { startServer, closeServer } from '../../main';
import { registerUser, getAccessTokenCookie, cleanUpUser } from './api-helper';
import * as Email from '../../lib/email';

chai.use(chaiString);

describe('Authentication API', () => {
  const prefix = '/api/v1/auth';
  let server;

  const testUserInfo = {
    email: 'clroot@kakao.com',
    username: 'clroot',
    password: 'password',
  };

  beforeAll(async (done) => {
    server = await startServer();
    done();
  });

  afterAll(async (done) => {
    await closeServer(server);
    done();
  });

  describe(`POST ${prefix}/register는 `, () => {
    const url = `${prefix}/register`;
    let stub;
    beforeAll((done) => {
      stub = sinon.stub(Email, 'sendEmail').resolves({ status: true });
      done();
    });
    afterAll((done) => {
      stub.restore();
      cleanUpUser(done);
    });

    describe('성공시 ', () => {
      it('user 객체를 return한다. ', (done) =>
        request(server)
          .post(url)
          .send(testUserInfo)
          .expect(httpStatus.CREATED)
          .then((res) => {
            const { username, _id } = res.body;
            assert.equal(username, testUserInfo.username);
            assert.isString(_id);
            done();
          }));
    });
    describe('실패시 ', () => {
      it('email이 중복되면 409 CONFLICT', (done) =>
        request(server)
          .post(url)
          .send(testUserInfo)
          .expect(httpStatus.CONFLICT)
          .end(done));
      it('field가 충족되지 않으면, 400 BAD_REQUEST', (done) =>
        request(server)
          .post(url)
          .send({})
          .expect(httpStatus.BAD_REQUEST)
          .end(done));
    });
  });

  describe(`POST ${prefix}/login는 `, () => {
    const url = `${prefix}/login`;
    beforeAll((done) => {
      registerUser(testUserInfo, done);
    });

    afterAll((done) => {
      cleanUpUser(done);
    });

    describe('성공시 ', () => {
      it('user 객체를 return한다.', (done) =>
        request(server)
          .post(url)
          .send(testUserInfo)
          .expect(httpStatus.OK)
          .then((res) => {
            const { username, _id } = res.body;
            assert.equal(username, testUserInfo.username);
            assert.isString(_id);
            done();
          }));
    });
    describe('실패시 ', () => {
      it('email이 존재하지 않으면, 404 NOT_FOUND', (done) =>
        request(server)
          .post(url)
          .send({ ...testUserInfo, email: 'no-user@clroot.io' })
          .expect(httpStatus.NOT_FOUND)
          .end(done));
      it('password가 일치하지 않으면, 401 UNAUTHORIZED', (done) =>
        request(server)
          .post(url)
          .send({ ...testUserInfo, password: 'wrong-password' })
          .expect(httpStatus.UNAUTHORIZED)
          .end(done));
      it('field가 충족되지 않으면, 400 BAD_REQUEST', (done) =>
        request(server)
          .post(url)
          .send({})
          .expect(httpStatus.BAD_REQUEST)
          .end(done));
    });
  });

  describe(`GET ${prefix}/check는`, () => {
    const url = `${prefix}/check`;
    let accessToken;

    beforeAll(async (done) => {
      await registerUser(testUserInfo);
      accessToken = await getAccessTokenCookie(server, testUserInfo);
      done();
    });

    afterAll((done) => {
      cleanUpUser(done);
    });

    describe('성공시 ', () => {
      it('user 객체를 return한다. ', (done) =>
        request(server)
          .get(url)
          .set('Cookie', accessToken)
          .expect(httpStatus.OK)
          .then((res) => {
            const { username, user: userId } = res.body;
            assert.isString(userId);
            assert.equal(username, testUserInfo.username);
            done();
          }));
    });
  });

  describe(`POST ${prefix}/logout`, () => {
    const url = `${prefix}/logout`;

    describe('성공시 ', () => {
      it('access-token을 비운다. ', (done) =>
        request(server)
          .post(url)
          .expect(httpStatus.NO_CONTENT)
          .then((res) => {
            const setCookie = res.headers['set-cookie'][0];
            expect(setCookie).to.startWith('access_token=;');
            done();
          }));
    });
  });

  describe(`GET ${prefix}/verify/:code는 `, () => {
    const url = `${prefix}/verify`;
    const code = 'right-code';
    let accessToken;

    beforeAll(async (done) => {
      await registerUser();
      accessToken = await getAccessTokenCookie(server);
      done();
    });
    afterAll(async (done) => {
      await cleanUpUser();
      done();
    });

    describe('성공시 ', () => {
      it('frontend로 redirect한다. ', (done) =>
        request(server)
          .get(`${url}/${code}`)
          .set('Cookie', accessToken)
          .expect(httpStatus.FOUND)
          .then((res) => {
            const ssmCookie = Array.from(
              res.headers['set-cookie'],
            ).find((iter) => iter.includes('ssm'));
            assert.isString(ssmCookie);
            assert.notInclude(ssmCookie, 'httponly');
            done();
          }));
    });
    describe('실패시 ', () => {
      it('옳바른 code가 전달되지 않으면, 400 BAD_REQUEST', (done) =>
        request(server)
          .get(`${url}/wrong-code`)
          .set('Cookie', accessToken)
          .expect(httpStatus.BAD_REQUEST)
          .end(done));
    });
  });
});
