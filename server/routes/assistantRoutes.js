import express from "express";
import { chatWithAssistant } from "../controllers/assistantController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", optionalAuth, chatWithAssistant);

export default router;
