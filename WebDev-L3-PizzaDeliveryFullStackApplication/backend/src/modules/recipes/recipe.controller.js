import {asyncHandler} from "../../utils/asyncHandler.js";
import * as service from "./recipe.service.js";
export const list=asyncHandler(async(req,res)=>res.json({success:true,data:{recipes:await service.listRecipes()}}));
export const get=asyncHandler(async(req,res)=>res.json({success:true,data:{recipe:await service.getRecipe(req.validated.params.productId)}}));
export const save=asyncHandler(async(req,res)=>res.json({success:true,data:{recipe:await service.saveRecipe(req.validated.params.productId,req.validated.body,req.user._id)}}));
