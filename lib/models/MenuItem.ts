import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVariant {
  label: string;
  price: number;
}

export interface IMenuItem extends Document {
  name: string;
  urduName: string;
  description: string;
  categorySlug: string;
  variants?: IVariant[];
  price?: number;
  badge: string;
  dealItems: string[];
  image: string;        // Cloudinary URL (empty = use category default)
  ingredients: string; // comma or newline separated
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>(
  { label: { type: String, required: true }, price: { type: Number, required: true } },
  { _id: false },
);

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name:         { type: String, required: true, trim: true },
    urduName:     { type: String, default: "" },
    description:  { type: String, default: "" },
    categorySlug: { type: String, required: true, index: true },
    variants:     { type: [VariantSchema], default: undefined },
    price:        { type: Number, default: undefined },
    badge:        { type: String, default: "" },
    dealItems:    { type: [String], default: [] },
    image:        { type: String, default: "" },
    ingredients:  { type: String, default: "" },   // comma or newline separated
    isActive:     { type: Boolean, default: true },
    sortOrder:    { type: Number, default: 0 },
  },
  { timestamps: true },
);

const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem ??
  mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);

export default MenuItem;
