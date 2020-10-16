import { Document, Model, model, Schema, Types } from 'mongoose';

const TagSchema = new Schema({
  name: String,
  user: {
    type: Types.ObjectId,
    ref: 'User',
  },
});

TagSchema.index({ name: 'text', user: 'text' });
export interface ITag {
  name: string;
  user: Types.ObjectId;
}

export interface ITagDocument extends ITag, Document {}

TagSchema.statics.findOrCreate = async function ({
  user,
  name,
}: ITagParameter) {
  let tag = await this.findOne({ name, user });
  if (!tag) {
    tag = await this.create({ name, user });
  }
  return tag;
};

TagSchema.statics.getIdByName = async function ({ user, name }: ITagParameter) {
  let tag = await this.findOne({ name, user });
  return tag.id;
};

TagSchema.statics.findByUser = async function (user: ITagParameter['user']) {
  return await this.find({ user }).select('name -_id');
};

export interface ITagParameter {
  user: Types.ObjectId;
  name: string;
}
interface ISerializedTag {
  name: string;
}

export interface ITagModel extends Model<ITagDocument> {
  findOrCreate({ user, name }: ITagParameter): Promise<ITagDocument>;
  getIdByName({ user, name }: ITagParameter): Promise<Types.ObjectId>;
  findByUser(user: Types.ObjectId): Promise<Array<ISerializedTag>>;
}

export default model<ITagDocument, ITagModel>('Tag', TagSchema);
