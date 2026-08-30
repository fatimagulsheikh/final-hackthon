import express from "express";

import {
  createTicket,
  getAgentTickets,
  assignTicket,
  resolveTicket,
  getMyTickets,
} from "../controllers/ticketController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer
router.post("/", protect, createTicket);

// Agent
router.post("/", protect, createTicket);

router.get("/my", protect, getMyTickets);

router.get("/agent", protect, getAgentTickets);

router.patch("/:id/assign", protect, assignTicket);

router.patch("/:id/resolve", protect, resolveTicket);

export default router;