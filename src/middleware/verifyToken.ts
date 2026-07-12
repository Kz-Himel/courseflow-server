import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose-cjs";
import { JWKS } from "../utils/jwks.js";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
      return;
    }

    const token = authorization.split(" ")[1];

    const { payload } = await jwtVerify(token, JWKS);

    req.user = payload;

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};