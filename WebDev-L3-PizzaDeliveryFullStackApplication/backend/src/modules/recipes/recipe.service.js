import mongoose from "mongoose";
import Recipe from "./recipe.model.js";
import InventoryItem from "../inventory/inventory.model.js";
import { ApiError } from "../../utils/ApiError.js";

export async function listRecipes() {
 return Recipe.find().sort({productNameSnapshot:1}).lean();
}
export async function saveRecipe(productId,payload,userId) {
 const ids=payload.ingredients.map(item=>item.inventoryItemId);
 if(new Set(ids).size!==ids.length) throw new ApiError(400,"An ingredient can only appear once in a recipe. Combine duplicate quantities.");
 const items=await InventoryItem.find({_id:{$in:ids},isActive:true}).select("_id name unit").lean();
 if(items.length!==ids.length) throw new ApiError(400,"One or more recipe ingredients are missing or inactive.");
 const byId=new Map(items.map(item=>[item._id.toString(),item]));
 for(const ingredient of payload.ingredients){if(byId.get(ingredient.inventoryItemId).unit!==ingredient.unit) throw new ApiError(400,`Unit mismatch for ${byId.get(ingredient.inventoryItemId).name}.`);}
 const existing=await Recipe.findOne({productId});
 const recipe=await Recipe.findOneAndUpdate({productId},{
  $set:{productNameSnapshot:payload.productNameSnapshot,ingredients:payload.ingredients,notes:payload.notes||"",isActive:payload.isActive??true,updatedBy:userId},
  $setOnInsert:{createdBy:userId},$inc:{version:1}
 },{new:true,upsert:true,runValidators:true,setDefaultsOnInsert:true});
 return recipe;
}
export async function getRecipe(productId){return Recipe.findOne({productId}).populate("ingredients.inventoryItemId","name unit isActive").lean();}
