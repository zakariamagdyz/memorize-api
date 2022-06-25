import mongoose from 'mongoose';
import { IPostDocument } from '../utils/types/models';

const schema = new mongoose.Schema<IPostDocument>(
  {
    title: String,
    message: String,
    creator: String,
    tags: [String],
    selectedFile: String,
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPostDocument>('Post', schema);
