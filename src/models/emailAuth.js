import mongoose, { Schema } from 'mongoose';

const EmailAuthSchema = new Schema({
  token: {
    type: String,
    index: true,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
});

const EmailAuth = mongoose.model('EmailAuth', EmailAuthSchema);

export default EmailAuth;
