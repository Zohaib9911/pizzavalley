import mongoose, { Schema, model, models } from "mongoose";

export interface IContact {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Contact = models.Contact || model<IContact>("Contact", ContactSchema);
export default Contact;
