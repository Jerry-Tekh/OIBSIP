import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import * as service from "./catalog.service.js";

const router = Router();
const categories = ["base", "sauce", "cheese", "vegetable"];

router.get("/builder-options/:slug", asyncHandler(async (req,res)=>{\n const slug=req.params.slug;\n if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ApiError(400,"Invalid product slug.");\n const options=await service.listProductBuilderOptions(slug);\n res.json({success:true,data:{options}});\n}));\n\nrouter.get("/builder-options", asyncHandler(async (req, res) => {
  const category = req.query.category;
  if (category && !categories.includes(category)) throw new ApiError(400, "Invalid builder category.");
  const options = await service.listBuilderInventoryOptions(category);
  res.json({ success: true, data: { options } });
}));

export default router;
