import mongoose, { Schema } from 'mongoose';

const ArticleSchema = new Schema({
  url: String,
  meta: {
    title: String,
    description: String,
  },
  tags: [String],
  publishedDate: {
    type: Date,
    default: Date.now,
  },
});

const Article = mongoose.model('Article', ArticleSchema);
export default Article;
