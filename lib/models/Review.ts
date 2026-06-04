import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  productId: string;   // MenuItem._id as string
  userId:    string;   // User._id as string
  userName:  string;
  rating:    number;   // 1–5
  comment:   string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: String, required: true, index: true },
    userId:    { type: String, required: true },
    userName:  { type: String, required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

// One review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review: Model<IReview> =
  mongoose.models.Review ??
  mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
