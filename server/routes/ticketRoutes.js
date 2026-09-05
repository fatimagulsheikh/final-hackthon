import express from "express";

import {
  createTicket,
  getAgentTickets,
  assignTicket,
  resolveTicket,
  getMyTickets,
  getTicketById,
  updateTicketStatus,
} from "../controllers/ticketController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// Customer
router.post("/", protect, createTicket);

router.get("/my", protect, getMyTickets);


// Agent
router.get("/agent", protect, getAgentTickets);

router.patch("/:id/assign", protect, assignTicket);

router.patch(
  "/:id/status",
  protect,
  updateTicketStatus
);

router.patch(
  "/:id/resolve",
  protect,
  resolveTicket
);


// Single ticket
router.get(
  "/:id",
  protect,
  getTicketById
);


export default router;