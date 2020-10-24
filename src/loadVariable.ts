import dotenv from 'dotenv';
import path from 'path';
const loadVariable: Function = () => {
  dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
  });
};

export default loadVariable;
