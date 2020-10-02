import mongoose from 'mongoose';

export const generateObjectId = () => new mongoose.Types.ObjectId();
