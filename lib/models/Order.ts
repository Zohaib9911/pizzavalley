import mongoose, { Schema, model, models } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  variant?: string;
  qty: number;
  price: number;
  categorySlug: string;
}

export interface IOrder {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  userId?: mongoose.Types.ObjectId;
  branch: "bahawalpur" | "yazman";
  customerName: string;
  customerEmail: string;   // optional for phone-only delivery orders
  customerPhone: string;
  address: string;
  items: IOrderItem[];
  subtotal: number;
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  notes?: string;
  deliveryLat?: number;    // verified GPS latitude
  deliveryLng?: number;    // verified GPS longitude
  deliveryDistanceKm?: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId:   { type: String, required: true },
    name:        { type: String, required: true },
    variant:     { type: String, default: "" },
    qty:         { type: Number, required: true, min: 1 },
    price:       { type: Number, required: true },
    categorySlug:{ type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber:   { type: String, unique: true },
    userId:        { type: Schema.Types.ObjectId, ref: "User", default: null },
    branch:        { type: String, enum: ["bahawalpur", "yazman"], default: "bahawalpur" },
    customerName:  { type: String, required: true, trim: true },
    customerEmail: { type: String, default: "", lowercase: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    address:       { type: String, required: true, trim: true },
    items:         { type: [OrderItemSchema], required: true },
    subtotal:      { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
    notes:               { type: String, default: "" },
    deliveryLat:         { type: Number, default: null },
    deliveryLng:         { type: Number, default: null },
    deliveryDistanceKm:  { type: Number, default: null },
  },
  { timestamps: true }
);

/* Auto-generate orderNumber before save — finds the highest existing number and increments */
OrderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    // Find the last order sorted by orderNumber descending
    const last = await mongoose.model("Order")
      .findOne({ orderNumber: { $exists: true, $ne: null } })
      .sort({ orderNumber: -1 })
      .select("orderNumber")
      .lean();

    let nextNum = 1;
    const lastDoc = last as unknown as { orderNumber?: string } | null;
    if (lastDoc?.orderNumber) {
      const match = lastDoc.orderNumber.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    this.orderNumber = `ORD-${String(nextNum).padStart(4, "0")}`;
  }
});

const Order = models.Order || model<IOrder>("Order", OrderSchema);
export default Order;
