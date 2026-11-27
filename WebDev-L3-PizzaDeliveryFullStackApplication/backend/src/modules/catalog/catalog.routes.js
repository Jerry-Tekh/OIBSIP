import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import * as service from "./catalog.service.js";

const router = Router();
const categories = ["base", "sauce", "cheese", "vegetable"];

router.get("/builder-options", asyncHandler(async (req, res) => {
  const category = req.query.category;
  if (category && !categories.includes(category)) throw new ApiError(400, "Invalid builder category.");
  const options = await service.listBuilderInventoryOptions(category);
  res.json({ success: true, data: { options } });
}));

export default router;
