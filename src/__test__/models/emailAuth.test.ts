import { expect } from 'chai';
import { EmailAuth } from '../../models';
import { generateObjectId } from '../test-utils';

describe('EmailAuth 모델은 ', () => {
  const sampleToken = '';
  const sampleUserId = generateObjectId();
  it('user, token 필드를 가진다.', (done) => {
    const record = new EmailAuth({ token: sampleToken, user: sampleUserId });
    expect(record.token).be.eq(sampleToken);
    expect(record.user).be.eq(sampleUserId);
    done();
  });
});
