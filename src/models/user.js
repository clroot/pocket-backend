import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { generateToken } from '../lib/token';

const UserSchema = new Schema({
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  hashedPassword: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
});

UserSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result;
};

UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};

UserSchema.methods.generateToken = function () {
  return generateToken({ _id: this.id, username: this.username });
};

UserSchema.methods.setVerified = async function () {
  this.isVerified = true;
  await this.save();
};

UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

UserSchema.statics.checkDuplication = async function ({ email, username }) {
  const check = await this.findOne({ $or: [{ email }, { username }] });
  return !!check;
};

const User = mongoose.model('User', UserSchema);

export default User;
