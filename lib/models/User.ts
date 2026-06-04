import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  password: string;        // empty string for Google-only accounts
  phone?: string;
  isAdmin: boolean;
  isBanned: boolean;       // flagged as bad / fraudulent user
  googleId?: string;       // Google OAuth subject ID
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      default: "",   // Google users have no password — validation is done in API routes
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      sparse: true,   // allows multiple null values in unique index
      unique: true,
    },
  },
  { timestamps: true }
);

// Prevent model re-registration on hot-reload
const User = models.User || model<IUser>("User", UserSchema);
export default User;
