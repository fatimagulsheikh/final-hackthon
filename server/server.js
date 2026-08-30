import "dotenv/config";
import dns from "dns";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

// ===============================
// HTTP SERVER
// ===============================
const httpServer = http.createServer(app);

// ===============================
// SOCKET.IO
// ===============================
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("join-ticket", (ticketId) => {
    socket.join(`ticket-${ticketId}`);

    console.log(
      `User joined ticket room: ticket-${ticketId}`
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// ROUTES
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/messages", messageRoutes);

// ===============================
// HOME ROUTE
// ===============================
app.get("/", (req, res) => {
  res.json({
    message: "SupportFlow API is running 🚀",
  });
});

// ===============================
// DATABASE + SERVER
// ===============================
const PORT = process.env.PORT || 5000;

connectDB();

httpServer.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT} 🚀`
  );
});