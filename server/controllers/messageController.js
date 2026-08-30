import Message from "../models/Message.js";
import Ticket from "../models/Ticket.js";

// ======================================
// SEND MESSAGE
// ======================================
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { ticketId } = req.params;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Customer can only message on their own ticket
    if (
      req.user.role === "customer" &&
      ticket.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own tickets",
      });
    }

    // Agent can only message assigned ticket
    if (
      req.user.role === "agent" &&
      (!ticket.assignedAgent ||
        ticket.assignedAgent.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "This ticket is not assigned to you",
      });
    }

    // Resolved tickets cannot receive messages
    if (ticket.status === "Resolved") {
      return res.status(400).json({
        success: false,
        message: "Resolved ticket cannot receive messages",
      });
    }

    // Create message
    const newMessage = await Message.create({
      ticket: ticketId,
      sender: req.user._id,
      message: message.trim(),
      senderRole: req.user.role,
    });

    // Assigned → In Progress when agent replies
    if (
      ticket.status === "Assigned" &&
      req.user.role === "agent"
    ) {
      ticket.status = "In Progress";
      await ticket.save();
    }

    // Populate sender information
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email role");

    // ======================================
    // SOCKET.IO - REAL TIME MESSAGE
    // ======================================
    const io = req.app.get("io");

    io.to(`ticket-${ticketId}`).emit(
      "new-message",
      populatedMessage
    );

    // Response
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// GET TICKET MESSAGES
// ======================================
export const getTicketMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Customer can only view own ticket
    if (
      req.user.role === "customer" &&
      ticket.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own tickets",
      });
    }

    // Agent can only view assigned ticket
    if (
      req.user.role === "agent" &&
      (!ticket.assignedAgent ||
        ticket.assignedAgent.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "This ticket is not assigned to you",
      });
    }

    const messages = await Message.find({
      ticket: ticketId,
    })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};