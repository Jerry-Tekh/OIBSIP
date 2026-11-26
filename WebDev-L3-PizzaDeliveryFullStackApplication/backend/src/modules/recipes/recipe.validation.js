import {z} from "zod";
const id=z.string().regex(/^[a-f\d]{24}$/i);
export const recipeListSchema=z.object({query:z.object({})});
export const recipeParamsSchema=z.object({params:z.object({productId:id})});
export const recipeSaveSchema=z.object({params:z.object({productId:id}),body:z.object({productNameSnapshot:z.string().trim().min(2).max(120).optional(),ingredients:z.array(z.object({inventoryItemId:id,quantityRequired:z.number().finite().positive(),unit:z.enum(["g","kg","ml","l","piece","bunch","pack","portion"])})).min(1).max(100),notes:z.string().trim().max(500).optional(),isActive:z.boolean().optional()})});
