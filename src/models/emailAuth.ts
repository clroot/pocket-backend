import { Schema, Types, Document, Model, model } from 'mongoose';

const EmailAuthSchema = new Schema({
  token: {
    type: String,
    index: true,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
});

export interface IEmailAuth {
  token: string;
  user: Types.ObjectId;
}

export interface IEmailAuthDocument extends IEmailAuth, Document {}
export interface IEmailAuthModel extends Model<IEmailAuthDocument> {}

export default model<IEmailAuthDocument, IEmailAuthModel>(
  'EmailAuth',
  EmailAuthSchema,
);
