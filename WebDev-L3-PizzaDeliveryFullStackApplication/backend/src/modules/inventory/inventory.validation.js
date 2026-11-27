import { z } from "zod";
const id = z.string().regex(/^[a-f0-9]{24}$/i, "A valid inventory ID is required.");
const builderFields = {
  isBuilderEligible: z.boolean().optional(),
  builderCategory: z.enum(["base", "sauce", "cheese", "vegetable"]).nullable().optional(),
  builderDescription: z.string().trim().max(500).optional(),
  builderImageUrl: z.string().trim().url().max(2048).nullable().optional(),
  builderSortOrder: z.number().int().min(-100000).max(100000).optional()
};
const itemFields = {
  name: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(60),
  unit: z.literal("g").default("g"),
  lowStockThreshold: z.number().finite().min(0),
  notes: z.string().trim().max(500).optional(),
  ...builderFields
};
export const listInventorySchema = z.object({ query: z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), search: z.string().trim().max(100).optional(), category: z.string().trim().max(60).optional(), status: z.enum(["active", "inactive", "low", "healthy"]).optional() }) });
export const createInventorySchema = z.object({ body: z.object({ ...itemFields, initialStock: z.number().finite().min(0) }).superRefine((v,ctx)=>{if(v.isBuilderEligible&&!v.builderCategory)ctx.addIssue({code:"custom",path:["builderCategory"],message:"Choose a builder category for eligible ingredients."});}) });
export const updateInventorySchema = z.object({ params: z.object({ id }), body: z.object({ name:itemFields.name.optional(), category:itemFields.category.optional(),  lowStockThreshold:itemFields.lowStockThreshold.optional(), notes:itemFields.notes, isActive:z.boolean().optional(), ...builderFields }).refine(v=>Object.values(v).some(x=>x!==undefined),"At least one field is required.").superRefine((v,ctx)=>{if(v.isBuilderEligible===true&&v.builderCategory===undefined)ctx.addIssue({code:"custom",path:["builderCategory"],message:"Choose a builder category for eligible ingredients."});}) });
export const adjustmentSchema = z.object({ params:z.object({id}), body:z.object({adjustmentType:z.enum(["restock","waste","correction"]),quantity:z.number().finite().min(0).max(100000000),reason:z.string().trim().min(3).max(300)}).superRefine((value,ctx)=>{if(value.adjustmentType!=="correction"&&value.quantity<=0)ctx.addIssue({code:"custom",path:["quantity"],message:"Quantity must be greater than zero."});}) });
export const movementSchema = z.object({ params:z.object({id}), query:z.object({page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(20)}) });
