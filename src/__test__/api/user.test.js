import request from 'supertest';
import chai, { assert } from 'chai';
import chaiString from 'chai-string';
import httpStatus from 'http-status';
import { startServer, closeServer } from '../../main';
import {
  registerUser,
  getAccessTokenCookie,
  saveArticle,
  updateArticle,
  cleanUpUser,
  cleanUpArticle,
  cleanUpTag,
  getEmailAuthToken,
} from './api-helper';

chai.use(chaiString);

describe('User API', () => {
  const prefix = '/api/v1/user';
  let server;

  let user;
  let accessTokenCookie;
  const testTagName = 'test1';
  const testNoneExistTagName = 'NoneExistTag';

  beforeAll(async (done) => {
    server = await startServer();
    user = await registerUser();
    accessTokenCookie = await getAccessTokenCookie(server);
    const article = await saveArticle(server, accessTokenCookie);
    await updateArticle(server, accessTokenCookie, article._id, {
      tags: [testTagName],
    });
    done();
  });

  afterAll(async (done) => {
    await cleanUpTag();
    await cleanUpArticle();
    await cleanUpUser();
    await closeServer(server);
    done();
  });

  describe(`GET ${prefix}/tags 는 `, () => {
    const url = `${prefix}/tags`;
    describe('성공시 ', () => {
      it('user의 tag 배열을 return한다.', (done) =>
        request(server)
          .get(url)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.OK)
          .then((res) => {
            assert.isArray(res.body);
            done();
          }));
    });
    describe('실패시 ', () => {
      it('login되어있지 않으면, 401 UNAUTHORIZED', (done) =>
        request(server).get(url).expect(httpStatus.UNAUTHORIZED).end(done));
    });
  });

  describe(`DELETE ${prefix}/tags/:name 는 `, () => {
    const url = `${prefix}/tags/${testTagName}`;
    describe('성공시 ', () => {
      it('해당 tag를 삭제한다.', (done) =>
        request(server)
          .delete(url)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.NO_CONTENT)
          .then((res) => {
            assert.isString(res.headers['removed-tag']);
            done();
          }));
    });
    describe('실패시 ', () => {
      it('login이 되어있지 않으면, 401 UNAUTHORIZED', (done) =>
        request(server).delete(url).expect(httpStatus.UNAUTHORIZED).end(done));
      it('해당 name의 태그가 없으면, 404 NOT_FOUND', (done) =>
        request(server)
          .delete(`${prefix}/tags/${testNoneExistTagName}`)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.NOT_FOUND)
          .end(done));
    });
  });

  describe(`POST ${prefix}/verify는 `, () => {
    const url = `${prefix}/verify`;
    let token;

    beforeAll(async (done) => {
      token = await getEmailAuthToken({ userId: user._id });
      done();
    });
    afterAll(async (done) => {
      await cleanUpUser();
      done();
    });

    describe('성공시 ', () => {
      it('frontend로 redirect한다. ', (done) =>
        request(server)
          .post(url)
          .set('Cookie', accessTokenCookie)
          .send({ token })
          .expect(httpStatus.OK)
          .then((res) => {
            assert.equal(res.body.type, 'email-verified');
            assert.isTrue(res.body.status);
            done();
          }));
    });
    describe('실패시 ', () => {
      it('옳바른 code가 전달되지 않으면, 404 NOT_FOUND', (done) =>
        request(server)
          .post(url)
          .send({ token: 'wrong-token' })
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.NOT_FOUND)
          .end(done));
    });
  });
});
