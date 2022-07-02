import mongoose, { HydratedDocument } from 'mongoose';
import { IPostDocument } from '../utils/types/models';

const schema = new mongoose.Schema<IPostDocument>(
  {
    title: String,
    message: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [String],
    image: String,
    likeCount: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    minimize: false,
  }
);

schema.pre(/^find/, function (this: HydratedDocument<IPostDocument>, next) {
  this.populate({ path: 'creator', select: 'name ' });
  next();
});

export default mongoose.model<IPostDocument>('Post', schema);
