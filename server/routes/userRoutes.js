import express from "express";
import { getMyProfile, getUserById, getUsers, updateMyProfile } from "../controllers/userController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.get("/", protect, adminOnly, getUsers);
router.get("/:id", protect, adminOnly, getUserById);

export default router;
