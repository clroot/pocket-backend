import request from 'supertest';
import chai, { assert, expect } from 'chai';
import chaiString from 'chai-string';
import httpStatus from 'http-status';
import { startServer, closeServer } from '../../main';
import User from '../../models/user';

chai.use(chaiString);

describe('Authentication API', () => {
  const prefix = '/api/v1/auth';
  let server;

  const user = {
    email: 'clroot@kakao.com',
    username: 'clroot',
    password: 'password',
  };

  beforeAll((done) => {
    server = startServer(4001);
    done();
  });

  afterAll(async (done) => {
    await closeServer(server);
    done();
  });

  describe(`POST ${prefix}/register는 `, () => {
    const url = `${prefix}/register`;
    afterAll((done) => {
      User.deleteMany({}).exec(done);
    });

    describe('성공시 ', () => {
      it('user 객체를 return한다. ', (done) =>
        request(server)
          .post(url)
          .send(user)
          .expect(httpStatus.CREATED)
          .then((res) => {
            const { username, _id } = res.body;
            assert.equal(username, user.username);
            assert.isString(_id);
            done();
          }));
    });
    describe('실패시 ', () => {
      it('email이 중복되면 409 CONFLICT', (done) =>
        request(server)
          .post(url)
          .send(user)
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
    beforeAll(async (done) => {
      const { email, username, password } = user;
      const record = new User({ email, username });
      await record.setPassword(password);
      await record.save();
      done();
    });

    afterAll((done) => {
      User.deleteMany({}).exec().then(done);
    });

    describe('성공시 ', () => {
      it('user 객체를 return한다.', (done) =>
        request(server)
          .post(url)
          .send(user)
          .expect(httpStatus.OK)
          .then((res) => {
            const { username, _id } = res.body;
            assert.equal(username, user.username);
            assert.isString(_id);
            done();
          }));
    });
    describe('실패시 ', () => {
      it('email이 존재하지 않으면, 404 NOT_FOUND', (done) =>
        request(server)
          .post(url)
          .send({ ...user, email: 'no-user@clroot.io' })
          .expect(httpStatus.NOT_FOUND)
          .end(done));
      it('password가 일치하지 않으면, 401 UNAUTHORIZED', (done) =>
        request(server)
          .post(url)
          .send({ ...user, password: 'wrong-password' })
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
    let accessTokenCookie;

    beforeAll(async (done) => {
      const { email, username, password } = user;
      const record = new User({ email, username });
      await record.setPassword(password);
      await record.save();
      done();
    });

    beforeAll((done) => {
      request(server)
        .post(`${prefix}/login`)
        .send(user)
        .then((res) => {
          accessTokenCookie = res.headers['set-cookie'];
          done();
        });
    });

    afterAll((done) => {
      User.deleteMany({}).exec().then(done);
    });

    describe('성공시 ', () => {
      it('user 객체를 return한다. ', (done) =>
        request(server)
          .get(url)
          .set('Cookie', accessTokenCookie)
          .expect(httpStatus.OK)
          .then((res) => {
            const { username, user: userId } = res.body;
            assert.isString(userId);
            assert.equal(username, user.username);
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
});
