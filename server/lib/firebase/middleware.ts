import type { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "./init";

export function requireFirebaseAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Extract bearer token
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
      // Verify token
      const decoded = await firebaseAuth.verifyIdToken(token);
      // Attach user info to the request
      req.auth = {
        userId: decoded.uid,
        email: decoded.email ?? undefined,
        imageUrl: decoded.picture ?? undefined,
      };
      return next();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
}
