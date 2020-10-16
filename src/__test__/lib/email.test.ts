import sinon, { SinonStub } from 'sinon';
import chai, { assert } from 'chai';
import chaiString from 'chai-string';
import * as Email from '../../lib/email';

chai.use(chaiString);
describe('Email 객체의 ', () => {
  describe('sendEmail() 는', () => {
    describe('성공시 ', () => {
      let stub: SinonStub;
      beforeAll((done) => {
        stub = sinon.stub(Email, 'sendEmail').resolves({ status: true });
        done();
      });
      afterAll((done) => {
        stub.restore();
        done();
      });

      it('email 이 발송된다', (done) => {
        Email.sendEmail({
          to: 'clroot@kakao.com',
          ...Email.createAuthEmail(''),
        }).then(({ status }) => {
          assert.isTrue(status);
          done();
        });
      }, 10000);
    });
  });
  describe('createAuthEmail() 는', () => {
    describe('성공시 ', () => {
      it('인증 email의 body와 title을 return 한다. ', (done) => {
        const { title, body } = Email.createAuthEmail('');
        assert.isNotEmpty(title);
        assert.isNotEmpty(body);
        done();
      });
    });
  });
});
