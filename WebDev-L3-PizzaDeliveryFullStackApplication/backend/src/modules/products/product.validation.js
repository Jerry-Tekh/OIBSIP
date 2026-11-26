import { z } from "zod";

const id = z.string().regex(/^[a-f\\d]{24}$/i, "Invalid product ID.");
const slug = z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.");
const httpsImage = z.string().url().max(2048).refine(value => {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "Product image URL must use HTTPS.");

const productFields = {
  name: z.string().trim().min(2).max(120),
  slug,
  description: z.string().trim().min(10).max(1200),
  shortDescription: z.string().trim().max(180).optional(),
  category: z.enum(["classic", "signature", "vegetarian", "spicy", "specialty"]),
  imageUrl: httpsImage,
  basePriceMinor: z.number().int().safe().min(0),
  currency: z.literal("NGN").default("NGN"),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100000).optional()
};

export const createProductSchema = z.object({ body: z.object(productFields) });
export const updateProductSchema = z.object({ params: z.object({ id }), body: z.object(productFields).partial().refine(value => Object.keys(value).length > 0, "Provide at least one field to update.") });
export const productParamsSchema = z.object({ params: z.object({ id }) });
export const publicProductParamsSchema = z.object({ params: z.object({ slug: z.string().trim().min(2).max(140) }) });
export const publicProductListSchema = z.object({ query: z.object({
  category: z.enum(["classic", "signature", "vegetarian", "spicy", "specialty"]).optional(),
  search: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12)
}) });
export const adminProductListSchema = z.object({ query: z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
}) });
