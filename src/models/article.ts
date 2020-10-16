import { Schema, Types, Document, Model, model } from 'mongoose';
import axios from 'axios';
import ogs from 'open-graph-scraper';
import cheerio from 'cheerio';
import Tag, { ITagParameter } from './tag';

const ArticleSchema = new Schema({
  url: String,
  meta: {
    title: String,
    description: String,
    img: String,
  },
  tags: [{ type: Types.ObjectId, ref: 'Tag' }],
  user: {
    type: Types.ObjectId,
    ref: 'User',
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

export interface IArticle {
  url: string;
  meta: {
    title: string;
    description: string;
    img: string;
  };
  tags: Types.ObjectId[];
  user: Types.ObjectId;
  createAt: Date;
}

ArticleSchema.methods.createMetaData = async function () {
  try {
    const { data: html }: { data: string } = await axios.get(this.url);
    const { result: ogData } = (await ogs({
      html,
    } as ogs.Options)) as ogs.SuccessResult;

    const title = ogData.ogTitle || cheerio.load(html)('title').text() || '';
    const description = ogData.ogDescription || '';
    const img = ogData.ogImage?.url || '';

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
      const record = await Tag.findOrCreate({
        user,
        name: tag,
      } as ITagParameter);
      return record.id;
    }),
  );

  this.tags = newTags;

  await this.save();
};

export interface IArticleDocument extends IArticle, Document {
  createMetaData(): Promise<void>;
  updateTagData(tags: ITagParameter[]): Promise<void>;
}

export interface IArticleModel extends Model<IArticleDocument> {}

export default model<IArticleDocument, IArticleModel>('Article', ArticleSchema);
