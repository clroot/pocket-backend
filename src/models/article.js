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
  tags: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
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

    await this.save();
  } catch (error) {
    console.error(error);
    throw new Error("Can not create article's meta data");
  }
};

ArticleSchema.methods.updateTagData = async function (tags) {
  const { user } = this;

  const newTags = await Promise.all(
    Array.from(tags).map(async (tag) => {
      const record = await Tag.findOrCreate(tag, user);
      return record.id;
    }),
  );

  this.tags = newTags;

  await this.save();
};

const Article = mongoose.model('Article', ArticleSchema);
export default Article;
