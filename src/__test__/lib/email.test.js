import sinon from 'sinon';
import chai, { assert } from 'chai';
import chaiString from 'chai-string';
import * as Email from '../../lib/email';

chai.use(chaiString);
describe('Email 객체의 ', () => {
  describe('sendEmail() 는', () => {
    describe('성공시 ', () => {
      let stub;
      beforeAll((done) => {
        stub = sinon.stub(Email, 'sendEmail').resolves({ status: true });
        done();
      });
      afterAll((done) => {
        stub.restore();
        done();
      });

      it('email이 발송된다', (done) => {
        Email.sendEmail({
          to: 'abcdkh1209@icloud.com',
          title: '메일 발송 테스트',
          body: '테스트 이메일입니다.',
        }).then(({ status }) => {
          sinon.assert.calledOnce(stub);
          assert.isTrue(status);
          done();
        });
      }, 10000);
    });
  });
});
