import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  let token;

  // Expected auth header format:
  // Authorization: Bearer <jwt-token>
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized, token missing"));
  }

  try {
    // Decode token and read user id we stored at login/register time.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      res.status(401);
      return next(new Error("Not authorized, user not found"));
    }

    next();
  } catch (error) {
    res.status(401);
    next(new Error("Not authorized, token invalid"));
  }
}

export function adminOnly(req, res, next) {
  // protect middleware runs before this, so req.user already exists.
  if (req.user?.role !== "admin") {
    res.status(403);
    return next(new Error("Admin access required"));
  }
  next();
}
