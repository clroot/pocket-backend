import mongoose, { Schema } from 'mongoose';
import axios from 'axios';
import ogs from 'open-graph-scraper';
import cheerio from 'cheerio';

const ArticleSchema = new Schema({
  url: String,
  meta: {
    title: String,
    description: String,
    img: String,
  },
  tags: [String],
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

const Article = mongoose.model('Article', ArticleSchema);
export default Article;
