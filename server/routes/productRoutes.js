import express from "express";
import {
  createProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductById,
  getProductBySlug,
  getProducts,
  searchProducts,
  updateProduct,
} from "../controllers/productController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/search", searchProducts);
router.get("/slug/:slug", getProductBySlug);

router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.get("/:id", getProductById);

export default router;
