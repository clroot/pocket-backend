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

  describe('Kakao OAuth 인증', () => {
    const url = `${prefix}/login/kakao`;
    it('카카오 로그인 요청시, 카카오로 redirect', () => {
      return request(server)
        .get(url)
        .expect(httpStatus.FOUND)
        .then((res) => {
          expect(res.header.location).to.startWith(
            'https://kauth.kakao.com/oauth/authorize?response_type=code&',
          );
        });
    });
  });
});
