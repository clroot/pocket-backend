import chai, { expect } from 'chai';
import chaiString from 'chai-string';
import SendEmail from '../../lib/sendEmail';

chai.use(chaiString);

describe('SendEmail 는', () => {
  describe('성공시 ', () => {
    it('email이 발송된다', (done) => {
      //TODO: Mocking
      SendEmail({
        title: '메일 발송 테스트',
        body: '테스트 이메일입니다.',
      }).then((res) => {
        expect(res.response).be.startsWith('250 Ok');
        done();
      });
    }, 10000);
  });
});
