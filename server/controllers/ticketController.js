import Ticket from "../models/Ticket.js";

// ======================================
// GENERATE TICKET NUMBER
// ======================================

const generateTicketNumber = () => {
  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `SUP-${random}`;
};


// ======================================
// CREATE TICKET - CUSTOMER
// ======================================

export const createTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
    } = req.body;

    // Only customers can create tickets
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can create tickets",
      });
    }

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Subject and description are required",
      });
    }

    let ticketNumber = generateTicketNumber();

    while (await Ticket.findOne({ ticketNumber })) {
      ticketNumber = generateTicketNumber();
    }

    const ticket = await Ticket.create({
      ticketNumber,
      customer: req.user._id,
      subject,
      description,
      category: category || "General",
      status: "New",
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });

  } catch (error) {
    console.error(
      "CREATE TICKET ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// GET ALL TICKETS - AGENT
// ======================================

export const getAgentTickets = async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Agents only.",
      });
    }

    const tickets = await Ticket.find()
      .populate(
        "customer",
        "name email"
      )
      .populate(
        "assignedAgent",
        "name email"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });

  } catch (error) {
    console.error(
      "GET AGENT TICKETS ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// GET MY TICKETS - CUSTOMER
// ======================================

export const getMyTickets = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Customers only.",
      });
    }

    const tickets = await Ticket.find({
      customer: req.user._id,
    })
      .populate(
        "assignedAgent",
        "name email"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });

  } catch (error) {
    console.error(
      "GET MY TICKETS ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// GET SINGLE TICKET
// ======================================

export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(
      req.params.id
    )
      .populate(
        "customer",
        "name email"
      )
      .populate(
        "assignedAgent",
        "name email"
      );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Customer can only see their own ticket
    if (
      req.user.role === "customer" &&
      ticket.customer._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only access your own tickets",
      });
    }

    // Agent can view all tickets
    // This allows agent to open a New ticket
    // and assign it to themselves
    if (
      req.user.role !== "customer" &&
      req.user.role !== "agent"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });

  } catch (error) {
    console.error(
      "GET TICKET ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// ASSIGN TICKET - AGENT
// ======================================

export const assignTicket = async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Agents only.",
      });
    }

    const ticket = await Ticket.findById(
      req.params.id
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.status === "Resolved") {
      return res.status(400).json({
        success: false,
        message:
          "Resolved ticket cannot be assigned",
      });
    }

    ticket.assignedAgent = req.user._id;
    ticket.status = "Assigned";

    await ticket.save();

    const updatedTicket =
      await Ticket.findById(ticket._id)
        .populate(
          "customer",
          "name email"
        )
        .populate(
          "assignedAgent",
          "name email"
        );

    // Socket.IO update
    const io = req.app.get("io");

    if (io) {
      io.to(`ticket-${ticket._id}`).emit(
        "ticket-status-updated",
        {
          ticketId: ticket._id,
          status: ticket.status,
        }
      );
    }

    res.status(200).json({
      success: true,
      message:
        "Ticket assigned successfully",
      ticket: updatedTicket,
    });

  } catch (error) {
    console.error(
      "ASSIGN TICKET ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// UPDATE STATUS - AGENT
// ======================================

export const updateTicketStatus = async (
  req,
  res
) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Agents only.",
      });
    }

    const { status } = req.body;

    const allowedStatuses = [
      "Assigned",
      "In Progress",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const ticket = await Ticket.findById(
      req.params.id
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Agent must be assigned to this ticket
    if (
      !ticket.assignedAgent ||
      ticket.assignedAgent.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This ticket is not assigned to you",
      });
    }

    if (ticket.status === "Resolved") {
      return res.status(400).json({
        success: false,
        message:
          "Resolved ticket cannot be changed",
      });
    }

    ticket.status = status;

    await ticket.save();

    // Socket.IO update
    const io = req.app.get("io");

    if (io) {
      io.to(`ticket-${ticket._id}`).emit(
        "ticket-status-updated",
        {
          ticketId: ticket._id,
          status: ticket.status,
        }
      );
    }

    const updatedTicket =
      await Ticket.findById(ticket._id)
        .populate(
          "customer",
          "name email"
        )
        .populate(
          "assignedAgent",
          "name email"
        );

    res.status(200).json({
      success: true,
      message:
        "Ticket status updated successfully",
      ticket: updatedTicket,
    });

  } catch (error) {
    console.error(
      "UPDATE STATUS ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// RESOLVE TICKET - AGENT
// ======================================

export const resolveTicket = async (
  req,
  res
) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Agents only.",
      });
    }

    const { resolutionNote } = req.body;

    if (
      !resolutionNote ||
      !resolutionNote.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Resolution note is required",
      });
    }

    const ticket = await Ticket.findById(
      req.params.id
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Agent must be assigned
    if (
      !ticket.assignedAgent ||
      ticket.assignedAgent.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This ticket is not assigned to you",
      });
    }

    if (ticket.status === "Resolved") {
      return res.status(400).json({
        success: false,
        message:
          "Ticket is already resolved",
      });
    }

    ticket.status = "Resolved";
    ticket.resolutionNote =
      resolutionNote.trim();

    await ticket.save();

    // Socket.IO update
    const io = req.app.get("io");

    if (io) {
      io.to(`ticket-${ticket._id}`).emit(
        "ticket-status-updated",
        {
          ticketId: ticket._id,
          status: ticket.status,
          resolutionNote:
            ticket.resolutionNote,
        }
      );
    }

    const updatedTicket =
      await Ticket.findById(ticket._id)
        .populate(
          "customer",
          "name email"
        )
        .populate(
          "assignedAgent",
          "name email"
        );

    res.status(200).json({
      success: true,
      message:
        "Ticket resolved successfully",
      ticket: updatedTicket,
    });

  } catch (error) {
    console.error(
      "RESOLVE TICKET ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};