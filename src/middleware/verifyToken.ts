import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secret_key = process.env.JWT_SECRET_KEY;

if (!secret_key) {
  throw new Error("Secret key not found");
}

export interface RequestWithUserId extends Request {
  userId?: string;
}

export const verifyToken = async (
  req: RequestWithUserId,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({
        message: "User unauthorized",
        success: false,
      });
      return;
    }

    const decode = jwt.verify(token, secret_key);
    if (!decode) {
      res.status(401).json({
        message: "Invalid token",
        success: false,
      });
      return;
    }

    req.userId = (decode as jwt.JwtPayload).userId;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
