import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Request } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-123456";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function comparePassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    const match = crypto.scryptSync(password, salt, 64).toString("hex");
    return hash === match;
  } catch (error) {
    return false;
  }
}

export function signToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string };
}
