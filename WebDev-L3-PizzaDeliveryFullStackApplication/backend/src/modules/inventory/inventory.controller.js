import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./inventory.service.js";
export const list=asyncHandler(async(req,res)=>res.json({success:true,data:await service.listInventory(req.validated.query)}));
export const create=asyncHandler(async(req,res)=>res.status(201).json({success:true,data:{item:await service.createInventory(req.validated.body,req.user._id)}}));
export const update=asyncHandler(async(req,res)=>res.json({success:true,data:{item:await service.updateInventory(req.validated.params.id,req.validated.body,req.user._id)}}));
export const adjust=asyncHandler(async(req,res)=>res.json({success:true,data:{item:await service.adjustInventory(req.validated.params.id,req.validated.body,req.user._id)}}));
export const movements=asyncHandler(async(req,res)=>res.json({success:true,data:await service.listMovements(req.validated.params.id,req.validated.query)}));
export const allMovements=asyncHandler(async(req,res)=>res.json({success:true,data:await service.listAllMovements(req.validated.query)}));
