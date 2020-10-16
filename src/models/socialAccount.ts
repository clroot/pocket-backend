import { Schema, Types, Document, model, Model } from 'mongoose';

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
    type: Types.ObjectId,
    ref: 'User',
  },
});

export interface ISocialAccount {
  provider: string;
  socialId: string;
  user: Types.ObjectId;
}

export interface ISocialAccountDocument extends ISocialAccount, Document {}

SocialAccountSchema.statics.findByOauthInfo = async function (
  provider: ISocialAccount['provider'],
  socialId: ISocialAccount['socialId'],
) {
  return await this.findOne({ provider, socialId });
};

export interface ISocialAccountModel extends Model<ISocialAccountDocument> {
  findByOauthInfo(
    provider: string,
    socialId: string,
  ): Promise<ISocialAccountDocument>;
}

export default model<ISocialAccountDocument, ISocialAccountModel>(
  'SocialAccount',
  SocialAccountSchema,
);
