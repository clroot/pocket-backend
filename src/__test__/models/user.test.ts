import { assert } from 'chai';
import { User, IUserDocument } from '../../models';
import { testUserInfo } from '../api/api-helper';

describe('User 모델은', () => {
  let user: IUserDocument;
  beforeEach(async (done) => {
    user = new User({ ...testUserInfo });
    await user.setPassword(testUserInfo.password);
    done();
  });

  it('email, username, hashedPassword, isVerified 필드를 가진다', async (done) => {
    assert.equal(user.email, testUserInfo.email);
    assert.equal(user.username, testUserInfo.username);
    assert.notEqual(user.hashedPassword, testUserInfo.password);
    assert.isTrue(await user.checkPassword(testUserInfo.password));
    assert.isFalse(user.isVerified);
    done();
  });
});
