import { z } from "zod";
const id = z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID.");
const slug = z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.");
const httpsImage = z.string().url().max(2048).refine(value => { try { return new URL(value).protocol === "https:"; } catch { return false; } }, "Product image URL must use HTTPS.");
const builderOption = z.object({
 inventoryItemId: id,
 category: z.enum(["base","sauce","cheese","vegetable"]),
 priceContributionMinor: z.number().int().safe().min(0),
 customerDescription: z.string().trim().max(500).optional(),
 sortOrder: z.number().int().min(0).max(100000).optional()
});
const builderOptions = z.array(builderOption).max(100).superRefine((options,ctx)=>{
 const seen = new Set();
 const counts = {base:0,sauce:0,cheese:0,vegetable:0};
 for (const option of options) {
  if (seen.has(option.inventoryItemId)) ctx.addIssue({code:"custom",message:"An inventory ingredient can only appear once in a product builder."});
  seen.add(option.inventoryItemId); counts[option.category] += 1;
 }
 if (counts.base > 5) ctx.addIssue({code:"custom",message:"A product can have at most five base choices."});
 if (counts.sauce > 5) ctx.addIssue({code:"custom",message:"A product can have at most five sauce choices."});
 if (counts.cheese < 1) ctx.addIssue({code:"custom",message:"Configure at least one cheese choice."});
 if (counts.base < 1 || counts.sauce < 1) ctx.addIssue({code:"custom",message:"Configure at least one base and one sauce choice."});
});
const productFields = {
 name:z.string().trim().min(2).max(120),slug,description:z.string().trim().min(10).max(1200),shortDescription:z.string().trim().max(180).optional(),
 category:z.enum(["classic","signature","vegetarian","spicy","specialty"]),imageUrl:httpsImage,basePriceMinor:z.number().int().safe().min(0).optional(),builderOptions,currency:z.literal("NGN").default("NGN"),
 isAvailable:z.boolean().optional(),sortOrder:z.number().int().min(0).max(100000).optional()
};
export const createProductSchema=z.object({body:z.object(productFields)});
export const updateProductSchema=z.object({params:z.object({id}),body:z.object(productFields).partial().refine(value=>Object.keys(value).length>0,"Provide at least one field to update.")});
export const productParamsSchema=z.object({params:z.object({id})});
export const productAvailabilitySchema=z.object({params:z.object({id}),body:z.object({isAvailable:z.boolean()})});
export const publicProductParamsSchema=z.object({params:z.object({slug:z.string().trim().min(2).max(140)})});
export const publicProductListSchema=z.object({query:z.object({category:z.enum(["classic","signature","vegetarian","spicy","specialty"]).optional(),search:z.string().trim().max(80).optional(),page:z.coerce.number().int().min(1).max(10000).default(1),limit:z.coerce.number().int().min(1).max(48).default(12)})});
export const adminProductListSchema=z.object({query:z.object({status:z.enum(["draft","published","archived"]).optional(),search:z.string().trim().max(80).optional(),page:z.coerce.number().int().min(1).max(10000).default(1),limit:z.coerce.number().int().min(1).max(100).default(20)})});
