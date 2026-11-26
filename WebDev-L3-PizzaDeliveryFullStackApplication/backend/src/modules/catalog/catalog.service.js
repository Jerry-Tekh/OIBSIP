import PizzaOption from "./catalog.model.js";
import {ApiError} from "../../utils/ApiError.js";
export async function listPublicOptions(category){const filter={isPublished:true,isAvailable:true};if(category)filter.category=category;return PizzaOption.find(filter).select("name slug category description priceContributionMinor currency imageUrl isAvailable").sort({category:1,name:1}).lean();}
export async function listAdminOptions(){return PizzaOption.find().sort({category:1,name:1}).lean();}
export async function createOption(payload,userId){try{return await PizzaOption.create({...payload,slug:payload.slug.toLowerCase().trim(),createdBy:userId,updatedBy:userId});}catch(e){if(e.code===11000)throw new ApiError(409,"An option with this slug already exists.");throw e;}}
export async function updateOption(id,payload,userId){const item=await PizzaOption.findByIdAndUpdate(id,{...payload,...(payload.slug?{slug:payload.slug.toLowerCase().trim()}:{}),updatedBy:userId},{new:true,runValidators:true});if(!item)throw new ApiError(404,"Pizza option not found.");return item;}
