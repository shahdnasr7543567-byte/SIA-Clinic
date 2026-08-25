import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";

export const requireRole = (...allowedRoles: Array<"admin" | "doctor" | "receptionist">) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: "Unauthorized. Please log in." },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Requires one of roles: [${allowedRoles.join(", ")}]`,
        },
      });
      return;
    }

    next();
  };
};
