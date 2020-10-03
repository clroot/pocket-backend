import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import loadVariable from './loadVariable';

class Database {
  constructor() {
    loadVariable();
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
  }

  async connect() {
    if (this.NODE_ENV === 'test') {
      this.memoryServer = new MongoMemoryServer();
      this.mongoUri = await this.memoryServer.getUri();
    }
    mongoose
      .connect(this.mongoUri, this.mongooseOpt)
      .then(() => {
        console.log('Connected to MongoDB...');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async closeConnect() {
    await mongoose.disconnect();
    if (this.NODE_ENV === 'test') await this.memoryServer.stop();
  }
}

const instance = new Database();

export default instance;
