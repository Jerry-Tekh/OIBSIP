import InventoryItem from "../inventory/inventory.model.js";
import PizzaProduct from "../products/product.model.js";
import { ApiError } from "../../utils/ApiError.js";

export async function listProductBuilderOptions(slug) {
 const product = await PizzaProduct.findOne({ slug, publicationStatus: "published", isAvailable: true }).select("builderOptions").lean();
 if (!product) throw new ApiError(404, "Pizza product not found.");
 const productOptions = product.builderOptions || [];
 const ids = productOptions.map(option => option.inventoryItemId);
 const inventory = await InventoryItem.find({ _id: { $in: ids } }).select("name builderCategory builderDescription builderImageUrl physicalStock reservedStock isActive isBuilderEligible").lean();
 const byId = new Map(inventory.map(item => [item._id.toString(), item]));
 return productOptions.map(option => {
  const item = byId.get(option.inventoryItemId.toString());
  if (!item) return null;
  return {
   id: item._id.toString(), name: item.name, category: option.category,
   description: option.customerDescription || item.builderDescription || "",
   imageUrl: item.builderImageUrl || null, priceContributionMinor: option.priceContributionMinor,
   currency: "NGN", sortOrder: option.sortOrder || 0,
   isAvailable: Boolean(item.isActive && item.isBuilderEligible && item.builderCategory === option.category && item.physicalStock - item.reservedStock > 0)
  };
 }).filter(Boolean).sort((a,b) => a.category.localeCompare(b.category) || a.sortOrder-b.sortOrder || a.name.localeCompare(b.name));
}

export async function validateProductBuilderSelection(product, configuration, { session } = {}) {
 const { baseId, sauceId, cheeseId, vegetableIds = [] } = configuration || {};
 if (!baseId || !sauceId || !cheeseId || !Array.isArray(vegetableIds)) throw new ApiError(400, "Choose one base, one sauce and one cheese. Vegetables are optional.");
 if (vegetableIds.length > 20 || new Set(vegetableIds).size !== vegetableIds.length) throw new ApiError(400, "Vegetable selections are invalid.");
 const selected = [baseId, sauceId, cheeseId, ...vegetableIds];
 if (selected.some(id => typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id))) throw new ApiError(400, "One or more ingredient IDs are invalid.");
 const configured = new Map((product.builderOptions || []).map(option => [option.inventoryItemId.toString(), option]));
 const selectedOptions = selected.map(id => configured.get(id));
 if (selectedOptions.some(option => !option)) throw new ApiError(400, "A selected ingredient is not configured for this pizza.");
 const expected = [[baseId,"base"],[sauceId,"sauce"],[cheeseId,"cheese"],...vegetableIds.map(id=>[id,"vegetable"])];
 for (let i=0;i<expected.length;i++) if (selectedOptions[i].category !== expected[i][1]) throw new ApiError(400, "A selected ingredient belongs to the wrong builder category.");
 const ids = selected;
 const query = InventoryItem.find({ _id: { $in: ids }, isActive: true, isBuilderEligible: true });
 if (session) query.session(session);
 const records = await query.lean();
 const byId = new Map(records.map(item => [item._id.toString(),item]));
 return expected.map(([id]) => {
  const item = byId.get(id);
  if (!item || item.builderCategory !== configured.get(id).category || item.unit !== "g") throw new ApiError(409, "A selected ingredient is no longer available.");
  if (item.physicalStock - item.reservedStock <= 0) throw new ApiError(409, item.name + " is currently out of stock.");
  return { ...item, productPriceContributionMinor: configured.get(id).priceContributionMinor };
 });
}
