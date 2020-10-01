import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let instance = undefined;
export default class Database {
  constructor() {
    if (instance) return instance;
    const { MONGO_URI, NODE_ENV } = process.env;

    this.mongoUri = MONGO_URI;
    this.NODE_ENV = NODE_ENV;
    this.mongooseOpt = {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    };
    this.memoryServer = null;

    instance = this;
  }

  static getInstance() {
    return new this();
  }

  async connect() {
    if (this.NODE_ENV === 'test') {
      this.memoryServer = new MongoMemoryServer();
      const URI = await this.memoryServer.getUri();

      mongoose
        .connect(URI, this.mongooseOpt)
        .then(() => console.log('Connected to In-Memory MongoDB'));
    } else {
      mongoose
        .connect(this.mongoUri, this.mongooseOpt)
        .then(() => {
          console.log('Connected to MongoDB...');
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  async closeConnect() {
    await mongoose.disconnect();
    if (this.NODE_ENV === 'test') await this.memoryServer.stop();
  }
}
