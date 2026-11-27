import InventoryItem from "../inventory/inventory.model.js";
import PizzaProduct from "../products/product.model.js";
import { ApiError } from "../../utils/ApiError.js";

const categories = ["base", "sauce", "cheese", "vegetable"];

export async function listBuilderInventoryOptions(category) {
  const filter = {
    isBuilderEligible: true,
    isActive: true,
    builderCategory: { $in: categories },
    $expr: { $gt: [{ $subtract: ["$physicalStock", "$reservedStock"] }, 0] }
  };
  if (category) filter.builderCategory = category;
  const rows = await InventoryItem.find(filter)
    .select("name builderCategory builderDescription builderPriceContributionMinor builderImageUrl builderSortOrder physicalStock reservedStock")
    .sort({ builderCategory: 1, builderSortOrder: 1, name: 1 }).lean();
  const categoryCounts = { base: 0, sauce: 0 };
  const visibleRows = rows.filter(item => {
    if (item.builderCategory !== "base" && item.builderCategory !== "sauce") return true;
    if (categoryCounts[item.builderCategory] >= 5) return false;
    categoryCounts[item.builderCategory] += 1;
    return true;
  });
  return visibleRows.map(({ _id, name, builderCategory, builderDescription, builderPriceContributionMinor, builderImageUrl, builderSortOrder, physicalStock, reservedStock }) => ({
    id: _id.toString(), name, category: builderCategory, description: builderDescription,
    priceContributionMinor: builderPriceContributionMinor, currency: "NGN",
    imageUrl: builderImageUrl, sortOrder: builderSortOrder,
    isAvailable: physicalStock - reservedStock > 0
  }));
}

export async function validateBuilderSelection(configuration, { session } = {}) {
  const { baseId, sauceId, cheeseId, vegetableIds = [] } = configuration || {};
  if (!baseId || !sauceId || !cheeseId || !Array.isArray(vegetableIds)) {
    throw new ApiError(400, "Choose one base, one sauce and one cheese. Vegetables are optional.");
  }
  if (vegetableIds.length > 20 || new Set(vegetableIds).size !== vegetableIds.length) {
    throw new ApiError(400, "Vegetable selections are invalid.");
  }
  const ids = [baseId, sauceId, cheeseId, ...vegetableIds];
  if (ids.some(id => typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id))) {
    throw new ApiError(400, "One or more ingredient IDs are invalid.");
  }
  const uniqueIds = [...new Set(ids)];
  const query = InventoryItem.find({ _id: { $in: uniqueIds }, isActive: true, isBuilderEligible: true });
  if (session) query.session(session);
  const ingredients = await query.lean();
  const byId = new Map(ingredients.map(item => [item._id.toString(), item]));
  const expected = [[baseId, "base"], [sauceId, "sauce"], [cheeseId, "cheese"], ...vegetableIds.map(id => [id, "vegetable"])];
  for (const [id, category] of expected) {
    const item = byId.get(id);
    if (!item || item.builderCategory !== category) throw new ApiError(409, "A selected ingredient is no longer available in this builder category.");
    if (item.physicalStock - item.reservedStock <= 0) throw new ApiError(409, `${item.name} is currently out of stock.`);
  }
  return expected.map(([id]) => byId.get(id));
}

export async function listProductBuilderOptions(slug) {
 const product = await PizzaProduct.findOne({ slug, publicationStatus: "published", isAvailable: true }).select("builderOptions").lean();
 if (!product) throw new ApiError(404, "Pizza product not found.");
 const ids = product.builderOptions.map(option => option.inventoryItemId);
 const inventory = await InventoryItem.find({ _id: { $in: ids } }).select("name builderCategory builderDescription builderImageUrl physicalStock reservedStock isActive isBuilderEligible").lean();
 const byId = new Map(inventory.map(item => [item._id.toString(), item]));
 return product.builderOptions.map(option => {
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
