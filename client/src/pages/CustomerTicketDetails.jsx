import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";
import api from "../api";

function CustomerTicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTicket();
    fetchMessages();

    if (!id) return;

    // Socket connect
    socket.connect();

    // Join ticket room
    socket.emit("join-ticket", id);

    // ===============================
    // NEW MESSAGE REAL-TIME
    // ===============================
    const handleNewMessage = (newMessage) => {
      setMessages((prev) => {
        const exists = prev.some(
          (item) => item._id === newMessage._id
        );

        if (exists) return prev;

        return [...prev, newMessage];
      });
    };

    // ===============================
    // TICKET STATUS REAL-TIME
    // ===============================
    const handleStatusUpdate = (data) => {
      if (data.ticketId === id) {
        setTicket((prev) => ({
          ...prev,
          status: data.status,
          resolutionNote:
            data.resolutionNote ||
            prev.resolutionNote,
        }));
      }
    };

    socket.on("new-message", handleNewMessage);

    socket.on(
      "ticket-status-updated",
      handleStatusUpdate
    );

    // ===============================
    // CLEANUP
    // ===============================
    return () => {
      socket.off(
        "new-message",
        handleNewMessage
      );

      socket.off(
        "ticket-status-updated",
        handleStatusUpdate
      );

      socket.disconnect();
    };
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await api.get(`/tickets/${id}`);

      setTicket(response.data.ticket);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${id}`);

      setMessages(response.data.messages || []);
    } catch (error) {
      console.log("Messages error:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      setSending(true);
      setError("");

      await api.post(`/messages/${id}`, {
        message: message.trim(),
      });

      setMessage("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <p>Loading ticket...</p>;
  }

  if (!ticket) {
    return <p>Ticket not found.</p>;
  }

  return (
    <div>
      <button onClick={() => navigate("/customer")}>
        ← Back to My Tickets
      </button>

      <h1>{ticket.ticketNumber}</h1>

      {error && <p>{error}</p>}

      <h2>{ticket.subject}</h2>

      <p>
        <strong>Category:</strong>{" "}
        {ticket.category}
      </p>

      <p>
        <strong>Priority:</strong>{" "}
        {ticket.priority}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        {ticket.status}
      </p>

      <hr />

      <h3>Your Issue</h3>

      <p>{ticket.description}</p>

      <hr />

      <h2>Conversation</h2>

      {messages.length === 0 && (
        <p>No messages yet.</p>
      )}

      {messages.map((item) => (
        <div key={item._id}>
          <strong>
            {item.sender?.name || item.senderRole}
          </strong>

          <p>{item.message}</p>

          <small>
            {new Date(
              item.createdAt
            ).toLocaleString()}
          </small>

          <hr />
        </div>
      ))}

      {ticket.status !== "Resolved" && (
        <>
          <h3>Reply</h3>

          <form onSubmit={sendMessage}>
            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Write your message..."
              rows="4"
            />

            <br />

            <button
              type="submit"
              disabled={sending}
            >
              {sending
                ? "Sending..."
                : "Send Message"}
            </button>
          </form>
        </>
      )}

      {ticket.status === "Resolved" && (
        <div>
          <h3>Resolution</h3>

          <p>{ticket.resolutionNote}</p>
        </div>
      )}
    </div>
  );
}

export default CustomerTicketDetails;