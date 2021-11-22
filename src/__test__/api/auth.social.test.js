import request from 'supertest';
import chai, { expect } from 'chai';
import chaiString from 'chai-string';
import sinon from 'sinon';
import httpStatus from 'http-status';
import { startServer, closeServer } from '../../';
import * as Email from '../../lib/email';

chai.use(chaiString);

describe('Social Authentication API', () => {
  const prefix = '/api/v1/auth/social';
  let server;

  beforeAll(async () => {
    server = await startServer();
  });

  afterAll(async () => {
    await closeServer(server);
  });

  describe(`POST ${prefix}/register 는`, () => {
    let stub;
    beforeAll((done) => {
      stub = sinon.stub(Email, 'sendEmail').resolves({ status: true });
      done();
    });
    afterAll((done) => {
      stub.restore();
      done();
    });
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
