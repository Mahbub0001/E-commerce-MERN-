import express from "express";
import {
  createOrder,
  deliverOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  payOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/pay", protect, payOrder);
router.put("/:id/deliver", protect, adminOnly, deliverOrder);

router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
