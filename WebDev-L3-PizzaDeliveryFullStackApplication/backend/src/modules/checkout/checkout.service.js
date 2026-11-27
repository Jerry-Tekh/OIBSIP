import PizzaProduct from "../products/product.model.js";
import { validateProductBuilderSelection } from "../catalog/catalog.service.js";
import { ApiError } from "../../utils/ApiError.js";

export async function previewOrder(items) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 20) {
    throw new ApiError(400, "An order must contain between 1 and 20 pizza items.");
  }
  const lines = [];
  for (const entry of items) {
    const slug = entry.productSlug;
    const quantity = Number(entry.quantity);
    if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new ApiError(400, "A valid product slug is required for each pizza.");
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new ApiError(400, "Pizza quantity must be between 1 and 20.");
    }
    const product = await PizzaProduct.findOne({
      slug, publicationStatus: "published", isAvailable: true
    }).select("name slug builderOptions currency").lean();
    if (!product) throw new ApiError(409, "A selected pizza product is no longer available.");

    const ingredients = await validateProductBuilderSelection(product, entry.configuration);
    const unitPriceMinor = ingredients.reduce((sum, item) => sum + item.productPriceContributionMinor, 0);
    if (!Number.isSafeInteger(unitPriceMinor)) throw new ApiError(400, "The calculated pizza price is too large.");
    const lineTotalMinor = unitPriceMinor * quantity;
    if (!Number.isSafeInteger(lineTotalMinor)) throw new ApiError(400, "The calculated order amount is too large.");

    lines.push({
      productSlug: product.slug,
      name: product.name,
      quantity,
      configuration: {
        baseId: entry.configuration.baseId,
        sauceId: entry.configuration.sauceId,
        cheeseId: entry.configuration.cheeseId,
        vegetableIds: entry.configuration.vegetableIds || []
      },
      ingredientSnapshots: ingredients.map(item => ({
        inventoryItemId: item._id,
        name: item.name,
        category: item.builderCategory,
        priceContributionMinor: item.productPriceContributionMinor
      })),
      unitPriceMinor,
      lineTotalMinor
    });
  }
  const subtotalMinor = lines.reduce((sum, line) => sum + line.lineTotalMinor, 0);
  if (!Number.isSafeInteger(subtotalMinor)) throw new ApiError(400, "The calculated order amount is too large.");
  return { items: lines, subtotalMinor, discountMinor: 0, taxMinor: 0, totalMinor: subtotalMinor, currency: "NGN" };
}
