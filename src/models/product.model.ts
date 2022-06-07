import mongoose from 'mongoose';
import { IProduct } from '../utils/types/schema';

const schema = new mongoose.Schema<IProduct>(
  {
    name: String,
    description: String,
    price: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduct>('Product', schema);
