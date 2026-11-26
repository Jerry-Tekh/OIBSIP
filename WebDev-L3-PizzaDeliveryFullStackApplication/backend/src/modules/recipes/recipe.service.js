import Recipe from "./recipe.model.js";
import InventoryItem from "../inventory/inventory.model.js";
import PizzaProduct from "../products/product.model.js";
import { ApiError } from "../../utils/ApiError.js";
export async function listRecipes(){return Recipe.find().sort({productNameSnapshot:1}).lean();}
export async function saveRecipe(productId,payload,userId){
 const product=await PizzaProduct.findById(productId).select("_id name").lean();
 if(!product)throw new ApiError(404,"Pizza product not found. Create the product before defining its recipe.");
 if(payload.productNameSnapshot!==product.name)payload={...payload,productNameSnapshot:product.name};
 const ids=payload.ingredients.map(item=>item.inventoryItemId);
 if(new Set(ids).size!==ids.length)throw new ApiError(400,"An ingredient can only appear once in a recipe. Combine duplicate quantities.");
 const items=await InventoryItem.find({_id:{$in:ids},isActive:true}).select("_id name unit").lean();
 if(items.length!==ids.length)throw new ApiError(400,"One or more recipe ingredients are missing or inactive.");
 const byId=new Map(items.map(item=>[item._id.toString(),item]));
 for(const ingredient of payload.ingredients){const item=byId.get(ingredient.inventoryItemId);if(item.unit!==ingredient.unit)throw new ApiError(400,`Unit mismatch for ${item.name}.`);}
 const existing=await Recipe.findOne({productId});
 if(existing){existing.productNameSnapshot=payload.productNameSnapshot;existing.ingredients=payload.ingredients;existing.notes=payload.notes||"";existing.isActive=payload.isActive??true;existing.updatedBy=userId;existing.version+=1;await existing.save();return existing;}
 return Recipe.create({productId,productNameSnapshot:payload.productNameSnapshot,ingredients:payload.ingredients,notes:payload.notes||"",isActive:payload.isActive??true,createdBy:userId,updatedBy:userId,version:1});
}
export async function getRecipe(productId){return Recipe.findOne({productId}).populate("ingredients.inventoryItemId","name unit isActive").lean();}
