import mongoose, { Schema } from 'mongoose';

const SocialAccountSchema = new Schema({
  provider: {
    type: String,
    trim: true,
  },
  socialId: {
    type: String,
    trim: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
});

SocialAccountSchema.statics.findByOauthInfo = async function (
  provider,
  socialId,
) {
  return await this.findOne({ provider, socialId });
};

const SocialAccount = mongoose.model('SocialAccount', SocialAccountSchema);

export default SocialAccount;
