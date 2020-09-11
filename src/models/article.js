import mongoose, { Schema } from 'mongoose';
import axios from 'axios';
import ogs from 'open-graph-scraper';
import cheerio from 'cheerio';
import Tag from './tag';

const ArticleSchema = new Schema({
  url: String,
  meta: {
    title: String,
    description: String,
    img: String,
  },
  tags: [String],
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

ArticleSchema.methods.createMetaData = async function () {
  try {
    const { data: html } = await axios.get(this.url);
    const { result: ogData } = await ogs({ html });

    const title =
      (ogData && (ogData.ogTitle || ogData.twitterTitle)) ||
      cheerio.load(html)('title').text() ||
      '';
    const description =
      (ogData && (ogData.ogDescription || ogData.twitterDescription)) || '';
    const img =
      (ogData &&
        ((ogData.ogImage && ogData.ogImage.url) ||
          (ogData.twitterImage && ogData.twitterImage.url))) ||
      '';

    this.meta.title = title;
    this.meta.description = description;
    this.meta.img = img;
  } catch (error) {
    console.error(error);
    throw new Error("Can not create article's meta data");
  }
};

ArticleSchema.methods.generateTagData = async function () {
  console.log(this.user);
  const ownerId = this.user._id;
  const tags = this.tags;
  if (tags) {
    tags.forEach(async (name) => {
      const tag = await Tag.findByNameAndOwnerId(name, ownerId);
      if (!tag) {
        const record = new Tag({ name, ownerId });
        await record.save();
      }
    });
  }
};

const Article = mongoose.model('Article', ArticleSchema);
export default Article;
