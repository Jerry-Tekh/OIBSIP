import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./checkout.service.js";
export const preview = asyncHandler(async (req, res) => {
  const result = await service.previewOrder(req.validated?.body?.items || req.body.items);
  res.json({ success: true, data: { ...result, totals: result } });
});
