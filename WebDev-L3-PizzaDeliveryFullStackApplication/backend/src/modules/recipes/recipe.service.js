import Recipe from "./recipe.model.js";
import InventoryItem from "../inventory/inventory.model.js";
import PizzaProduct from "../products/product.model.js";
import { ApiError } from "../../utils/ApiError.js";

export async function listRecipes() {
  return Recipe.find({})
    .populate("productId", "name slug publicationStatus")
    .populate("ingredients.inventoryItemId", "name unit isActive")
    .sort({ productNameSnapshot: 1 })
    .lean();
}

export async function saveRecipe(productId, payload, userId) {
  const product = await PizzaProduct.findById(productId)
    .select("_id name publicationStatus")
    .lean();

  if (!product) {
    throw new ApiError(
      404,
      "Pizza product not found. Create the product before defining its recipe."
    );
  }

  if (product.publicationStatus === "published") {
    throw new ApiError(
      409,
      "Unpublish this product before modifying its recipe."
    );
  }

  if (product.publicationStatus === "archived") {
    throw new ApiError(
      409,
      "Archived products cannot have recipes changed."
    );
  }

  const ids = payload.ingredients.map((item) => item.inventoryItemId);
  if (new Set(ids).size !== ids.length) {
    throw new ApiError(
      400,
      "An ingredient can only appear once in a recipe. Combine duplicate quantities."
    );
  }

  const items = await InventoryItem.find({
    _id: { $in: ids },
    isActive: true
  })
    .select("_id name unit")
    .lean();

  if (items.length !== ids.length) {
    throw new ApiError(
      400,
      "One or more recipe ingredients are missing or inactive."
    );
  }

  const byId = new Map(items.map((item) => [item._id.toString(), item]));
  for (const ingredient of payload.ingredients) {
    const item = byId.get(ingredient.inventoryItemId);
    if (!item || item.unit !== ingredient.unit) {
      throw new ApiError(
        400,
        `Unit mismatch for ${item?.name || "an ingredient"}.`
      );
    }
  }

  const existing = await Recipe.findOne({ productId });

  if (existing) {
    existing.productNameSnapshot = product.name;
    existing.ingredients = payload.ingredients;
    existing.notes = payload.notes || "";
    existing.isActive = payload.isActive ?? true;
    existing.updatedBy = userId;
    existing.version += 1;
    await existing.save();
    return existing;
  }

  try {
    return await Recipe.create({
      productId,
      productNameSnapshot: product.name,
      ingredients: payload.ingredients,
      notes: payload.notes || "",
      isActive: payload.isActive ?? true,
      createdBy: userId,
      updatedBy: userId,
      version: 1
    });
  } catch (error) {
    // The unique productId index protects against two admins creating
    // the same product recipe at the same time. Retry as an update.
    if (error?.code !== 11000) throw error;

    const recipe = await Recipe.findOne({ productId });
    if (!recipe) throw error;

    recipe.productNameSnapshot = product.name;
    recipe.ingredients = payload.ingredients;
    recipe.notes = payload.notes || "";
    recipe.isActive = payload.isActive ?? true;
    recipe.updatedBy = userId;
    recipe.version += 1;
    await recipe.save();
    return recipe;
  }
}

export async function getRecipe(productId) {
  return Recipe.findOne({ productId })
    .populate("productId", "name slug publicationStatus")
    .populate("ingredients.inventoryItemId", "name unit isActive")
    .lean();
}
