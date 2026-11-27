import InventoryItem from "../inventory/inventory.model.js";
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
  return rows.map(({ _id, name, builderCategory, builderDescription, builderPriceContributionMinor, builderImageUrl, builderSortOrder, physicalStock, reservedStock }) => ({
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
