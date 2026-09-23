import express from "express";
import {
  createProduct,
  createProductReview,
  deleteProduct,
  deleteProductReview,
  getAIShoppingAdvice,
  getAllReviews,
  getFeaturedProducts,
  getPersonalizedRecommendations,
  getProductById,
  getProductBySlug,
  getProductCategories,
  getProductRecommendations,
  getProducts,
  searchProducts,
  updateProduct,
} from "../controllers/productController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/categories", getProductCategories);
router.get("/featured", getFeaturedProducts);
router.get("/search", searchProducts);
router.get("/slug/:slug", getProductBySlug);

// Recommendation endpoints (must be before /:id)
router.get("/recommendations/personalized", getPersonalizedRecommendations);
router.post("/recommendations/ai-advisor", getAIShoppingAdvice);
router.get("/:id/recommendations", getProductRecommendations);

// Admin review aggregation (must be before /:id)
router.get("/reviews/all", protect, adminOnly, getAllReviews);

router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

// Review submission and moderation
router.post("/:id/reviews", protect, createProductReview);
router.delete("/:id/reviews/:reviewId", protect, adminOnly, deleteProductReview);

router.get("/:id", getProductById);

export default router;
