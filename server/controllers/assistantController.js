import { processAssistantChat } from "../services/aiService.js";

export async function chatWithAssistant(req, res, next) {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      res.status(400);
      throw new Error("Message is required");
    }

    const response = await processAssistantChat({
      message: message.trim(),
      history: history || [],
      user: req.user || null,
    });

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
}
