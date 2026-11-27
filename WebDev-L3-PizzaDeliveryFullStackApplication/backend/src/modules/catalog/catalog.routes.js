import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import * as service from "./catalog.service.js";

const router = Router();

router.get("/builder-options/:slug", asyncHandler(async (req, res) => {
  const slug = req.params.slug;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ApiError(400, "Invalid product slug.");
  const options = await service.listProductBuilderOptions(slug);
  res.json({ success: true, data: { options } });
}));

export default router;
