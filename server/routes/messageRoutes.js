import express from "express";

import {
  sendMessage,
  getTicketMessages,
} from "../controllers/messageController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:ticketId", protect, sendMessage);

router.get("/:ticketId", protect, getTicketMessages);

export default router;