import PizzaProduct from "./product.model.js";
import Recipe from "../recipes/recipe.model.js";
import InventoryItem from "../inventory/inventory.model.js";
import { ApiError } from "../../utils/ApiError.js";

const escapeRegex = value => value.replace(/[.*+?^${}()|[\\]\\]/g, "\\const escapeRegex = value => value.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\const publicFields =");
");

const publicFields = "name slug description shortDescription category imageUrl basePriceMinor currency isAvailable sortOrder publishedAt";

export async function listAdminProducts({ status, search, page, limit }) {
  const filter = {};
  if (status) filter.publicationStatus = status;
  if (search) { const term = escapeRegex(search); filter.$or = [{ name: { $regex: term, $options: "i" } }, { slug: { $regex: term, $options: "i" } }]; }
  const [products, total] = await Promise.all([
    PizzaProduct.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    PizzaProduct.countDocuments(filter)
  ]);
  return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getAdminProduct(id) {
  const product = await PizzaProduct.findById(id).lean();
  if (!product) throw new ApiError(404, "Pizza product not found.");
  const recipe = await Recipe.findOne({ productId: product._id }).populate("ingredients.inventoryItemId", "name unit isActive").lean();
  return { ...product, recipe };
}

export async function createProduct(payload, userId) {
  try {
    return await PizzaProduct.create({ ...payload, slug: payload.slug.toLowerCase(), createdBy: userId, updatedBy: userId });
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "A product with this slug already exists.");
    throw error;
  }
}

export async function updateProduct(id, payload, userId) {
  const product = await PizzaProduct.findById(id);
  if (!product) throw new ApiError(404, "Pizza product not found.");
  if (product.publicationStatus !== "draft") throw new ApiError(409, "Only draft products can be edited. Unpublish the product before editing.");
  Object.assign(product, payload, { updatedBy: userId });
  try { await product.save(); }
  catch (error) { if (error.code === 11000) throw new ApiError(409, "A product with this slug already exists."); throw error; }
  return product;
}

export async function publishProduct(id, userId) {
  const product = await PizzaProduct.findById(id);
  if (!product) throw new ApiError(404, "Pizza product not found.");
  if (product.publicationStatus === "archived") throw new ApiError(409, "Archived products cannot be published. Create a new product instead.");
  if (product.publicationStatus === "published") return product;

  const recipe = await Recipe.findOne({ productId: product._id, isActive: true }).lean();
  if (!recipe || !recipe.ingredients?.length) throw new ApiError(409, "Add an active recipe with at least one ingredient before publishing this product.");

  const ingredientIds = recipe.ingredients.map(item => item.inventoryItemId.toString());
  const inventoryItems = await InventoryItem.find({ _id: { $in: ingredientIds }, isActive: true }).select("_id unit").lean();
  if (inventoryItems.length !== ingredientIds.length) throw new ApiError(409, "The recipe contains an ingredient that is missing or inactive.");
  const units = new Map(inventoryItems.map(item => [item._id.toString(), item.unit]));
  if (recipe.ingredients.some(item => units.get(item.inventoryItemId.toString()) !== item.unit)) {
    throw new ApiError(409, "The recipe contains an ingredient unit that no longer matches inventory.");
  }

  product.publicationStatus = "published";
  product.publishedAt = new Date();
  product.publishedBy = userId;
  product.updatedBy = userId;
  await product.save();
  return product;
}

export async function unpublishProduct(id, userId) {
  const product = await PizzaProduct.findById(id);
  if (!product) throw new ApiError(404, "Pizza product not found.");
  if (product.publicationStatus === "archived") throw new ApiError(409, "Archived products cannot be changed.");
  product.publicationStatus = "draft";
  product.updatedBy = userId;
  await product.save();
  return product;
}

export async function archiveProduct(id, userId) {
  const product = await PizzaProduct.findById(id);
  if (!product) throw new ApiError(404, "Pizza product not found.");
  product.publicationStatus = "archived";
  product.isAvailable = false;
  product.updatedBy = userId;
  await product.save();
  return product;
}

export async function listPublicProducts({ category, search, page, limit }) {
  const filter = { publicationStatus: "published", isAvailable: true };
  if (category) filter.category = category;
  if (search) { const term = escapeRegex(search); filter.$or = [{ name: { $regex: term, $options: "i" } }, { description: { $regex: term, $options: "i" } }]; }
  const [products, total] = await Promise.all([
    PizzaProduct.find(filter).select(publicFields).sort({ sortOrder: 1, name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    PizzaProduct.countDocuments(filter)
  ]);
  return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getPublicProduct(slug) {
  const product = await PizzaProduct.findOne({ slug, publicationStatus: "published", isAvailable: true }).select(publicFields).lean();
  if (!product) throw new ApiError(404, "Pizza product not found.");
  return product;
}

export async function setProductAvailability(id, isAvailable, userId) {
  const product = await PizzaProduct.findById(id);
  if (!product) throw new ApiError(404, "Pizza product not found.");
  if (product.publicationStatus !== "published") throw new ApiError(409, "Only published products can have storefront availability changed.");
  product.isAvailable = isAvailable;
  product.updatedBy = userId;
  await product.save();
  return product;
}
