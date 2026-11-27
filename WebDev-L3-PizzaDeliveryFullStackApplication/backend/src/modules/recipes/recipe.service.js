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

  // A single upsert avoids the find-then-create race and guarantees one
  // persisted recipe per product (enforced by the unique productId index).
  const recipe = await Recipe.findOneAndUpdate(
    { productId },
    {
      $set: {
        productNameSnapshot: product.name,
        ingredients: payload.ingredients,
        notes: payload.notes || "",
        isActive: payload.isActive ?? true,
        updatedBy: userId
      },
      $setOnInsert: {
        createdBy: userId,
        version: 0
      },
      $inc: { version: 1 }
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: false
    }
  );

  return recipe;
}

export async function getRecipe(productId) {
  return Recipe.findOne({ productId })
    .populate("productId", "name slug publicationStatus")
    .populate("ingredients.inventoryItemId", "name unit isActive")
    .lean();
}
