import { ApiError } from "../utils/ApiError.js";

// Authentication answers "who are you?"; authorization answers "what may you do?"
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action."));
    }

    next();
  };
}
