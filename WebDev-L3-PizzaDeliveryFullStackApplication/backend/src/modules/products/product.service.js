import PizzaProduct from "./product.model.js";
import InventoryItem from "../inventory/inventory.model.js";
import { ApiError } from "../../utils/ApiError.js";
const escapeRegex = value => value.split("").map(char => "\\^$.*+?()[]{}|".includes(char) ? "\\" + char : char).join("");
const publicFields = "name slug description shortDescription category imageUrl currency isAvailable sortOrder publishedAt";
export async function listAdminProducts({status,search,page,limit}) {
 const filter={}; if(status)filter.publicationStatus=status;
 if(search){const term=escapeRegex(search);filter.$or=[{name:{$regex:term,$options:"i"}},{slug:{$regex:term,$options:"i"}}];}
 const [products,total]=await Promise.all([PizzaProduct.find(filter).sort({updatedAt:-1}).skip((page-1)*limit).limit(limit).lean(),PizzaProduct.countDocuments(filter)]);
 return {products,pagination:{page,limit,total,pages:Math.ceil(total/limit)}};
}
export async function getAdminProduct(id) {
 const product=await PizzaProduct.findById(id).lean();if(!product)throw new ApiError(404,"Pizza product not found.");
 return product;
}
async function validateProductBuilderOptions(options = []) {
 const ids = options.map(option => option.inventoryItemId);
 if (new Set(ids.map(String)).size !== ids.length) throw new ApiError(400, "An inventory ingredient can only appear once in a product builder.");
 const records = await InventoryItem.find({ _id: { $in: ids }, isActive: true, isBuilderEligible: true }).select("_id builderCategory unit").lean();
 const byId = new Map(records.map(item => [item._id.toString(), item]));
 const counts = {base:0,sauce:0,cheese:0,vegetable:0};
 for (const option of options) {
  const item = byId.get(String(option.inventoryItemId));
  if (!item || item.builderCategory !== option.category) throw new ApiError(400, "Every builder choice must reference an active, eligible inventory ingredient in the same category.");
  if (item.unit !== "g") throw new ApiError(400, "Pizza builder ingredients must use grams (g).");
  counts[option.category] += 1;
 }
 if (counts.base < 1 || counts.sauce < 1 || counts.cheese < 1) throw new ApiError(400, "Each product requires at least one base, one sauce and one cheese choice.");
 if (counts.base > 5 || counts.sauce > 5) throw new ApiError(400, "Each product can have at most five base and five sauce choices.");
}
export async function createProduct(payload,userId) {
 try{await validateProductBuilderOptions(payload.builderOptions || []);return await PizzaProduct.create({...payload,slug:payload.slug.toLowerCase(),createdBy:userId,updatedBy:userId});}
 catch(error){if(error.code===11000)throw new ApiError(409,"A product with this slug already exists.");throw error;}
}
export async function updateProduct(id,payload,userId) {
 const product=await PizzaProduct.findById(id);if(!product)throw new ApiError(404,"Pizza product not found.");
 if(product.publicationStatus!=="draft")throw new ApiError(409,"Only draft products can be edited. Unpublish the product before editing.");
 if (payload.builderOptions) await validateProductBuilderOptions(payload.builderOptions);
 Object.assign(product,payload,{updatedBy:userId});
 try{await product.save();}catch(error){if(error.code===11000)throw new ApiError(409,"A product with this slug already exists.");throw error;}return product;
}
export async function publishProduct(id,userId) {
 const product=await PizzaProduct.findById(id);
 if(!product)throw new ApiError(404,"Pizza product not found.");
 if(product.publicationStatus==="published")return product;
 await validateProductBuilderOptions(product.builderOptions || []);
 product.publicationStatus="published";product.publishedAt=new Date();product.publishedBy=userId;product.updatedBy=userId;
 await product.save();return product;
}
export async function unpublishProduct(id,userId) {
 const product=await PizzaProduct.findById(id);if(!product)throw new ApiError(404,"Pizza product not found.");
 product.publicationStatus="draft";product.updatedBy=userId;await product.save();return product;
}
export async function setProductAvailability(id,isAvailable,userId) {
 const product=await PizzaProduct.findById(id);if(!product)throw new ApiError(404,"Pizza product not found.");
 if(product.publicationStatus!=="published")throw new ApiError(409,"Only published products can have storefront availability changed.");
 product.isAvailable=isAvailable;product.updatedBy=userId;await product.save();return product;
}
export async function listPublicProducts({category,search,page,limit}) {
 const filter={publicationStatus:"published",isAvailable:true};if(category)filter.category=category;
 if(search){const term=escapeRegex(search);filter.$or=[{name:{$regex:term,$options:"i"}},{description:{$regex:term,$options:"i"}}];}
 const [products,total]=await Promise.all([PizzaProduct.find(filter).select(publicFields).sort({sortOrder:1,name:1}).skip((page-1)*limit).limit(limit).lean(),PizzaProduct.countDocuments(filter)]);
 return {products,pagination:{page,limit,total,pages:Math.ceil(total/limit)}};
}
export async function getPublicProduct(slug) {
 const product=await PizzaProduct.findOne({slug,publicationStatus:"published",isAvailable:true}).select(publicFields).lean();
 if(!product)throw new ApiError(404,"Pizza product not found.");return product;
}

export async function deleteProduct(id) {
  const product = await PizzaProduct.findById(id);
  if (!product) throw new ApiError(404, "Pizza product not found.");
  await PizzaProduct.deleteOne({ _id: product._id });
  return { id: product._id.toString(), deleted: true };
}
