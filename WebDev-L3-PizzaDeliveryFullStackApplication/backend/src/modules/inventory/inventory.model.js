import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  normalizedName: { type: String, required: true, unique: true, lowercase: true, trim: true },
  sku: { type: String, trim: true, uppercase: true, maxlength: 40, sparse: true, unique: true },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  unit: { type: String, required: true, enum: ["g", "kg", "ml", "l", "piece", "bunch", "pack", "portion"] },
  physicalStock: { type: Number, required: true, min: 0, default: 0 },
  reservedStock: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, required: true, min: 0, default: 0 },
  isActive: { type: Boolean, default: true },
  // Builder fields deliberately live on the inventory record: inventory remains the source of truth.
  isBuilderEligible: { type: Boolean, default: false },
  builderCategory: { type: String, enum: ["base", "sauce", "cheese", "vegetable", null], default: null },
  builderPriceContributionMinor: { type: Number, min: 0, default: 0 },
  builderDescription: { type: String, trim: true, maxlength: 500, default: "" },
  builderImageUrl: { type: String, trim: true, maxlength: 2048, default: null },
  builderSortOrder: { type: Number, int: true, default: 0 },
  notes: { type: String, trim: true, maxlength: 500, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true, versionKey: false });

inventoryItemSchema.index({ category: 1, isActive: 1 });
inventoryItemSchema.index({ name: "text", sku: "text" });
inventoryItemSchema.index({ isBuilderEligible: 1, builderCategory: 1, isActive: 1, builderSortOrder: 1 });
inventoryItemSchema.virtual("availableStock").get(function () { return this.physicalStock - this.reservedStock; });

inventoryItemSchema.pre("validate", function (next) {
  if (!this.isBuilderEligible) {
    this.builderCategory = null;
    this.builderPriceContributionMinor = 0;
    this.builderDescription = "";
    this.builderImageUrl = null;
    this.builderSortOrder = 0;
  } else if (!this.builderCategory) {
    this.invalidate("builderCategory", "A builder category is required when an item is builder-eligible.");
  }
  next();
});

export default mongoose.model("InventoryItem", inventoryItemSchema);
