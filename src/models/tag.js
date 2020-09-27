import mongoose, { Schema } from 'mongoose';

const TagSchema = new Schema({
  name: String,
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
});

TagSchema.statics.findOrCreate = async function (name, user) {
  let tag = await this.findOne({ name, user });
  if (!tag) {
    tag = await this.create({ name, user });
  }
  return tag;
};
TagSchema.statics.findByUser = function (user) {
  return this.find({ user }).select('name -_id');
};

const Tag = mongoose.model('Tag', TagSchema);

export default Tag;
