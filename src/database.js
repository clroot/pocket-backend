import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

class Database {
  constructor() {
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

const instance = new Database();

export default instance;
