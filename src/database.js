import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export default class Database {
  constructor() {
    this.mongooseOpt = {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    };
  }

  async connect() {
    const { MONGO_URI, NODE_ENV } = process.env;
    if (NODE_ENV === 'test') {
      const mongod = new MongoMemoryServer();
      const URI = await mongod.getUri();
      console.log(URI);
      mongoose
        .connect(URI, this.mongooseOpt)
        .then(() => console.log('Connected to In-Memory MongoDB'));
    } else {
      mongoose
        .connect(MONGO_URI, this.mongooseOpt)
        .then(() => {
          console.log('Connected to MongoDB...');
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
}
