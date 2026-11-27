import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./product.service.js";
import {
  createProductSchema, updateProductSchema, productParamsSchema,
  publicProductParamsSchema, publicProductListSchema, adminProductListSchema, productAvailabilitySchema
} from "./product.validation.js";

const router = Router();

// Admin product management is deliberately separate from PizzaOption management.
const admin = Router();
admin.use(authenticate, authorize("admin"));
admin.get("/", validate(adminProductListSchema), asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.listAdminProducts(req.validated.query) });
}));
admin.post("/", validate(createProductSchema), asyncHandler(async (req, res) => {
  const product = await service.createProduct(req.validated.body, req.user._id);
  res.status(201).json({ success: true, data: { product } });
}));
admin.get("/:id", validate(productParamsSchema), asyncHandler(async (req, res) => {
  res.json({ success: true, data: { product: await service.getAdminProduct(req.validated.params.id) } });
}));
admin.patch("/:id", validate(updateProductSchema), asyncHandler(async (req, res) => {
  const product = await service.updateProduct(req.validated.params.id, req.validated.body, req.user._id);
  res.json({ success: true, data: { product } });
}));
admin.patch("/:id/availability", validate(productAvailabilitySchema), asyncHandler(async (req, res) => {
  const product = await service.setProductAvailability(req.validated.params.id, req.validated.body.isAvailable, req.user._id);
  res.json({ success: true, data: { product } });
}));
admin.post("/:id/publish", validate(productParamsSchema), asyncHandler(async (req, res) => {
  const product = await service.publishProduct(req.validated.params.id, req.user._id);
  res.json({ success: true, data: { product } });
}));
admin.post("/:id/unpublish", validate(productParamsSchema), asyncHandler(async (req, res) => {
  const product = await service.unpublishProduct(req.validated.params.id, req.user._id);
  res.json({ success: true, data: { product } });
}));
admin.delete("/:id", validate(productParamsSchema), asyncHandler(async (req, res) => {
  const result = await service.deleteProduct(req.validated.params.id);
  res.json({ success: true, data: result });
}));
admin.post("/:id/archive", validate(productParamsSchema), asyncHandler(async (req, res) => {
  const product = await service.archiveProduct(req.validated.params.id, req.user._id);
  res.json({ success: true, data: { product } });
}));

router.use("/admin", admin);

// Public storefront endpoints expose published, available products only.
router.get("/", validate(publicProductListSchema), asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.listPublicProducts(req.validated.query) });
}));
router.get("/:slug", validate(publicProductParamsSchema), asyncHandler(async (req, res) => {
  res.json({ success: true, data: { product: await service.getPublicProduct(req.validated.params.slug) } });
}));

export default router;
