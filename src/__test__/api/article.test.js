import request from 'supertest';
import chai, { assert, expect } from 'chai';
import chaiString from 'chai-string';
import httpStatus from 'http-status';
import { startServer, closeServer } from '../../main';
import {
  registerUser,
  removeUser,
  getAccessTokenCookie,
  cleanUpUser,
  cleanUpArticle,
  saveArticle,
} from './api-helper';
import { generateObjectId } from '../test-utils';

describe('Article API', () => {
  const prefix = '/api/v1/articles';
  const sampleArticle = {
    url: 'https://github.com/clroot/pocket-backend',
    tags: [],
  };
  let server;
  let accessTokenCookie;

  beforeAll(async (done) => {
    server = startServer(4001);
    await registerUser();
    accessTokenCookie = await getAccessTokenCookie(server);
    done();
  });

  afterAll(async (done) => {
    await closeServer(server);
    await cleanUpArticle();
    await cleanUpUser();
    done();
  });

  describe(`GET ${prefix} 는`, () => {
    const url = prefix;

    describe('성공시 ', () => {
      it('article 배열을 return한다. ', (done) =>
        request(server)
          .get(url)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.OK)
          .then((res) => {
            //TODO: res 검증
            done();
          }));
    });
    describe('실패시 ', () => {
      it('access-token이 없으면, 401 UNAUTHORIZED', (done) =>
        request(server).get(url).expect(httpStatus.UNAUTHORIZED).end(done));
      it('page가 0보다 작으면, 400 BAD_REQUEST', (done) =>
        request(server)
          .get(`${url}?page=-1`)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.BAD_REQUEST)
          .end(done));
    });
  });

  describe(`POST ${prefix}는 `, () => {
    const url = prefix;

    afterAll((done) => {
      cleanUpArticle(done);
    });

    describe('성공시 ', () => {
      it('article 객체를 return한다.', (done) =>
        request(server)
          .post(url)
          .send(sampleArticle)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.CREATED)
          .then((res) => {
            //TODO: [article] 검증
            done();
          }));
    });
    describe('실패시 ', () => {
      it('access-token이 없으면, 401 UNAUTHORIZED', (done) =>
        request(server)
          .post(url)
          .send(sampleArticle)
          .expect(httpStatus.UNAUTHORIZED)
          .end(done));
      it('field가 충족되지 않으면, 400 BAD_REQUEST', (done) =>
        request(server)
          .post(url)
          .send({})
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.BAD_REQUEST)
          .end(done));
    });
  });

  describe(`GET ${prefix}/:id는 `, () => {
    let id;

    beforeAll(async (done) => {
      const { _id } = await saveArticle(server, accessTokenCookie);
      id = _id;
      done();
    });
    afterAll((done) => {
      cleanUpArticle(done);
    });

    describe('성공시 ', () => {
      it('id의 article 객체를 return한다.', (done) =>
        request(server)
          .get(`${prefix}/${id}`)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.OK)
          .then((res) => {
            //TODO: 검증
            done();
          }));
    });
    describe('실패시 ', () => {
      it('해당 id의 article이 존재하지 않으면, 404 NOT_FOUND', (done) =>
        request(server)
          .get(`${prefix}/${generateObjectId()}`)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.NOT_FOUND)
          .end(done));
    });
  });

  describe(`DELETE ${prefix}/:id는 `, () => {
    let id;
    beforeEach(async (done) => {
      const { _id } = await saveArticle(server, accessTokenCookie);
      id = _id;
      done();
    });
    afterEach((done) => {
      cleanUpArticle(done);
    });

    describe('성공시 ', () => {
      it('해당 article을 삭제한다.', (done) =>
        request(server)
          .delete(`${prefix}/${id}`)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.NO_CONTENT)
          .end(done));
    });
    describe('실패시 ', () => {
      const anotherUser = {
        email: 'another@clroot.io',
        username: 'another',
        password: 'another-password',
      };
      let anotherAccessToken;

      beforeAll(async (done) => {
        await registerUser(anotherUser);
        anotherAccessToken = await getAccessTokenCookie(server, anotherUser);
        done();
      });
      afterAll(async (done) => {
        await removeUser(anotherUser);
        done();
      });

      it('현재 user의 소유가 아닌 경우, 403 FORBIDDEN', (done) =>
        request(server)
          .delete(`${prefix}/${id}`)
          .set('Cookie', anotherAccessToken)
          .expect(httpStatus.FORBIDDEN)
          .end(done));
      it('해당 id의 article이 존재하지 않으면, 404 NOT_FOUND', (done) =>
        request(server)
          .delete(`${prefix}/${generateObjectId()}`)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.NOT_FOUND)
          .end(done));
    });
  });

  describe(`PATCH ${prefix}/:id는 `, () => {
    const updateArticle = {
      tags: ['sampleTag'],
    };
    let id;

    beforeAll(async (done) => {
      const { _id } = await saveArticle(server, accessTokenCookie);
      id = _id;
      done();
    });

    afterAll((done) => {
      cleanUpArticle(done);
    });

    describe('성공시 ', () => {
      it('해당 article을 수정한다.', (done) =>
        request(server)
          .patch(`${prefix}/${id}`)
          .send(updateArticle)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.OK)
          .then((res) => {
            //TODO: 검증
            done();
          }));
    });
    describe('실패시 ', () => {
      const anotherUser = {
        email: 'another@clroot.io',
        username: 'another',
        password: 'another-password',
      };
      let anotherAccessToken;

      beforeAll(async (done) => {
        await registerUser(anotherUser);
        anotherAccessToken = await getAccessTokenCookie(server, anotherUser);
        done();
      });
      afterAll(async (done) => {
        await removeUser(anotherUser);
        done();
      });

      it('현재 user의 소유가 아닌 경우, 403 FORBIDDEN', (done) =>
        request(server)
          .patch(`${prefix}/${id}`)
          .send(updateArticle)
          .set('Cookie', anotherAccessToken)
          .expect(httpStatus.FORBIDDEN)
          .end(done));
      it('해당 id의 article이 존재하지 않으면, 404 NOT_FOUND', (done) =>
        request(server)
          .patch(`${prefix}/${generateObjectId()}`)
          .send(updateArticle)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.NOT_FOUND)
          .end(done));
    });
  });
});
