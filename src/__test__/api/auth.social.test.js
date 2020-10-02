import request from 'supertest';
import chai, { expect } from 'chai';
import chaiString from 'chai-string';
import httpStatus from 'http-status';
import { startServer, closeServer } from '../../main';

chai.use(chaiString);

describe('Social Authentication API', () => {
  const prefix = '/api/v1/auth/social';
  let server;

  beforeAll(async () => {
    server = startServer(4001);
  });

  afterAll(async () => {
    await closeServer(server);
  });

  describe(`POST ${prefix}/register 는`, () => {
    //TODO: 테스트 구현
  });

  describe(`GET ${prefix}/login/kakao 는`, () => {
    const url = `${prefix}/login/kakao`;
    describe('성공시 ', () => {
      it('카카오 인증페이지로 REDIRECT한다.', (done) =>
        request(server)
          .get(url)
          .expect(httpStatus.FOUND)
          .then((res) => {
            expect(res.headers.location).to.be.startsWith(
              'https://kauth.kakao.com',
            );
            done();
          }));
    });
  });

  describe(`GET ${prefix}/callback/kakao 는`, () => {
    //TODO: 테스트 구현
  });
});
