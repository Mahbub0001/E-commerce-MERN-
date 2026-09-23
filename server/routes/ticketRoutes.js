import express from "express";
import {
  deleteTicket,
  getAllTickets,
  updateTicketStatus,
} from "../controllers/ticketController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getAllTickets);
router.put("/:id/status", protect, adminOnly, updateTicketStatus);
router.delete("/:id", protect, adminOnly, deleteTicket);

export default router;
