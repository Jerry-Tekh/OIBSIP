import mongoose from "mongoose";
import InventoryItem from "./inventory.model.js";
import InventoryMovement from "./movement.model.js";
import { ApiError } from "../../utils/ApiError.js";
const escapeRegex = value => value.split("").map(char => "\\^$.*+?()[]{}|".includes(char) ? "\\" + char : char).join("");
const restrictedBuilderCategories = new Set(["base", "sauce"]);
async function enforceBuilderCategoryLimit(payload, currentId = null) {
  const enabled = payload.isBuilderEligible === true;
  const category = payload.builderCategory;
  if (!enabled || !category || !restrictedBuilderCategories.has(category)) return;
  const filter = { isBuilderEligible: true, builderCategory: category, isActive: true };
  if (currentId) filter._id = { $ne: currentId };
  const count = await InventoryItem.countDocuments(filter);
  if (count >= 5) throw new ApiError(409, `Only five active builder choices are allowed in the ${category} category. Disable or remove builder eligibility from an existing choice first.`);
}
export async function listInventory({page,limit,search,category,status}) {
 const filter={};if(category)filter.category=category;if(status==="active")filter.isActive=true;if(status==="inactive")filter.isActive=false;
 if(status==="low"){filter.isActive=true;filter.$expr={$lte:[{$subtract:["$physicalStock","$reservedStock"]},"$lowStockThreshold"]};}
 if(status==="healthy"){filter.isActive=true;filter.$expr={$gt:[{$subtract:["$physicalStock","$reservedStock"]},"$lowStockThreshold"]};}
 if(search){const term=escapeRegex(search);filter.$or=[{name:{$regex:term,$options:"i"}},{sku:{$regex:term,$options:"i"}},{category:{$regex:term,$options:"i"}}];}
 const [items,total]=await Promise.all([InventoryItem.find(filter).sort({name:1}).skip((page-1)*limit).limit(limit).lean(),InventoryItem.countDocuments(filter)]);
 const rows=items.map(item=>({...item,availableStock:item.physicalStock-item.reservedStock,isLowStock:item.physicalStock-item.reservedStock<=item.lowStockThreshold}));
 return {items:rows,pagination:{page,limit,total,pages:Math.ceil(total/limit)}};
}
export async function createInventory(payload,userId) {
 await enforceBuilderCategoryLimit(payload);
 const session=await mongoose.startSession();let created;
 try{await session.withTransaction(async()=>{
  const normalizedName=payload.name.toLowerCase().trim();const {initialStock,...metadata}=payload;
  const [item]=await InventoryItem.create([{...metadata,sku:metadata.sku?.trim().toUpperCase()||undefined,normalizedName,physicalStock:initialStock,reservedStock:0,createdBy:userId,updatedBy:userId}],{session});created=item;
  if(initialStock>0)await InventoryMovement.create([{inventoryItemId:item._id,movementType:"initial_stock",direction:"in",quantity:initialStock,unit:item.unit,physicalStockBefore:0,physicalStockAfter:initialStock,reason:"Initial stock recorded when ingredient was created",actorUserId:userId}],{session});
 });}catch(error){if(error.code===11000)throw new ApiError(409,"An ingredient with this name or SKU already exists.");throw error;}finally{await session.endSession();}return created;
}
export async function updateInventory(id,payload,userId) {
 const item=await InventoryItem.findById(id);if(!item)throw new ApiError(404,"Inventory item not found.");
 await enforceBuilderCategoryLimit({...item.toObject(),...payload},id);
 if(payload.name){item.name=payload.name;item.normalizedName=payload.name.toLowerCase().trim();}
 if(Object.prototype.hasOwnProperty.call(payload,"sku"))item.sku=payload.sku?.trim().toUpperCase()||undefined;
 for(const key of ["category","unit","lowStockThreshold","notes","isActive","isBuilderEligible","builderCategory","builderPriceContributionMinor","builderDescription","builderImageUrl","builderSortOrder"])if(payload[key]!==undefined)item[key]=payload[key];
 item.updatedBy=userId;try{await item.save();return item;}catch(error){if(error.code===11000)throw new ApiError(409,"An ingredient with this name or SKU already exists.");throw error;}
}
export async function listPublicBuilderOptions(category) {
 const filter={isBuilderEligible:true,isActive:true,builderCategory:{$in:["base","sauce","cheese","vegetable"]}};
 if(category)filter.builderCategory=category;
 const rows=await InventoryItem.find(filter).select("name builderCategory builderDescription builderPriceContributionMinor builderImageUrl builderSortOrder unit physicalStock reservedStock").sort({builderCategory:1,builderSortOrder:1,name:1}).lean();
 return rows.map(({_id,name,builderCategory,builderDescription,builderPriceContributionMinor,builderImageUrl,builderSortOrder,physicalStock,reservedStock})=>({id:_id.toString(),name,category:builderCategory,description:builderDescription,priceContributionMinor:builderPriceContributionMinor,currency:"NGN",imageUrl:builderImageUrl,sortOrder:builderSortOrder,isAvailable:physicalStock-reservedStock>0}));
}
export async function adjustInventory(id,{adjustmentType,quantity,reason},userId) {
 const session=await mongoose.startSession();let updated;
 try{await session.withTransaction(async()=>{
  const item=await InventoryItem.findById(id).session(session);if(!item)throw new ApiError(404,"Inventory item not found.");
  const before=item.physicalStock;let after=before;let direction="in";if(adjustmentType==="restock")after=before+quantity;else if(adjustmentType==="waste"){after=before-quantity;direction="out";}else{after=quantity;direction=after>=before?"in":"out";}
  if(after<item.reservedStock)throw new ApiError(409,"This adjustment would make physical stock lower than already reserved stock.");
  const delta=Math.abs(after-before);if(delta===0)throw new ApiError(400,"The correction does not change the stock balance.");
  item.physicalStock=after;item.updatedBy=userId;await item.save({session});
  await InventoryMovement.create([{inventoryItemId:item._id,movementType:adjustmentType,direction,quantity:delta,unit:item.unit,physicalStockBefore:before,physicalStockAfter:after,reason,actorUserId:userId}],{session});updated=item;
 });}finally{await session.endSession();}
 return {...updated.toObject(),availableStock:updated.physicalStock-updated.reservedStock,isLowStock:updated.physicalStock-updated.reservedStock<=updated.lowStockThreshold};
}
export async function listMovements(id,{page,limit}) {
 const item=await InventoryItem.findById(id).select("_id").lean();if(!item)throw new ApiError(404,"Inventory item not found.");
 const [movements,total]=await Promise.all([InventoryMovement.find({inventoryItemId:id}).sort({createdAt:-1}).skip((page-1)*limit).limit(limit).populate("actorUserId","name email").lean(),InventoryMovement.countDocuments({inventoryItemId:id})]);
 return {movements,pagination:{page,limit,total,pages:Math.ceil(total/limit)}};
}
export async function listAllMovements({page,limit}) {
 const [movements,total]=await Promise.all([InventoryMovement.find({}).sort({createdAt:-1}).skip((page-1)*limit).limit(limit).populate("inventoryItemId","name unit").populate("actorUserId","name email").lean(),InventoryMovement.countDocuments({})]);
 return {movements,pagination:{page,limit,total,pages:Math.ceil(total/limit)}};
}
