import mongoose from "mongoose";

const productBuilderOptionSchema = new mongoose.Schema({
  inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem", required: true },
  category: { type: String, enum: ["base", "sauce", "cheese", "vegetable"], required: true },
  priceContributionMinor: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  customerDescription: { type: String, trim: true, maxlength: 500, default: "" },
  sortOrder: { type: Number, min: 0, max: 100000, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 140 },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1200 },
  shortDescription: { type: String, trim: true, maxlength: 180, default: "" },
  category: { type: String, required: true, enum: ["classic", "signature", "vegetarian", "spicy", "specialty"] },
  imageUrl: { type: String, trim: true, required: true, maxlength: 2048 },
  basePriceMinor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  builderOptions: { type: [productBuilderOptionSchema], default: [] },
  currency: { type: String, required: true, enum: ["NGN"], default: "NGN" },
  publicationStatus: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
  isAvailable: { type: Boolean, default: true },
  sortOrder: { type: Number, min: 0, max: 100000, default: 0 },
  publishedAt: { type: Date, default: null },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true, versionKey: false });

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ publicationStatus: 1, isAvailable: 1, category: 1, sortOrder: 1 });
productSchema.index({ name: "text", description: "text" });

export default mongoose.model("PizzaProduct", productSchema);
