import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { preview } from "./checkout.controller.js";

const router = Router();
const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const line = z.object({
  productSlug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  quantity: z.number().int().min(1).max(20),
  configuration: z.object({
    baseId: objectId, sauceId: objectId, cheeseId: objectId,
    vegetableIds: z.array(objectId).max(20).default([])
  })
});
const schema = z.object({ body: z.object({ items: z.array(line).min(1).max(20) }) });
router.post("/preview", validate(schema), preview);
export default router;
