import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";
import api from "../api";
import "./CustomerTicketDetails.css";

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

    socket.connect();
    socket.emit("join-ticket", id);

    const handleNewMessage = (newMessage) => {
      setMessages((prev) => {
        const exists = prev.some(
          (item) => item._id === newMessage._id
        );

        if (exists) return prev;

        return [...prev, newMessage];
      });
    };

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

    return () => {
      socket.off("new-message", handleNewMessage);
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
    return (
      <div className="customer-loading">
        Loading ticket...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="customer-loading">
        Ticket not found.
      </div>
    );
  }

  return (
    <div className="customer-ticket-page">

      {/* TOP BAR */}
      <div className="customer-ticket-topbar">

        <div className="customer-nav-left">

          <button
            className="customer-back-btn"
            onClick={() => navigate("/customer/tickets")}
          >
            ←
          </button>

          <div className="customer-nav-brand">

            <div className="customer-nav-logo">
              S
            </div>

            <div>
              <h2>SupportFlow</h2>
              <span>Customer Support Portal</span>
            </div>

          </div>

        </div>

        <div className="customer-ticket-number">
          {ticket.ticketNumber}
        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="customer-error">
          {error}
        </div>
      )}

      <div className="customer-ticket-layout">

        {/* TICKET HEADER */}
        <div className="customer-ticket-card">

          <div className="customer-ticket-heading">

            <div>
              <span className="customer-ticket-label">
                SUPPORT TICKET
              </span>

              <h1>{ticket.subject}</h1>
            </div>

            <span
              className={`customer-status-badge ${ticket.status
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {ticket.status}
            </span>

          </div>

          <div className="customer-ticket-info">

            <div>
              <span>Category</span>
              <strong>{ticket.category}</strong>
            </div>

            <div>
              <span>Priority</span>
              <strong>{ticket.priority}</strong>
            </div>

            <div>
              <span>Ticket Number</span>
              <strong>{ticket.ticketNumber}</strong>
            </div>

          </div>

        </div>

        {/* DESCRIPTION */}
        <div className="customer-ticket-card">

          <h2>Your Issue</h2>

          <div className="customer-description">
            {ticket.description}
          </div>

        </div>

        {/* CONVERSATION */}
        <div className="customer-ticket-card">

          <div className="customer-section-header">

            <div>
              <h2>Conversation</h2>

              <p>
                Communication with support agent
              </p>
            </div>

            <span className="customer-message-count">
              {messages.length} Messages
            </span>

          </div>

          <div className="customer-conversation">

            {messages.length === 0 && (
              <div className="customer-empty-message">

                <div className="customer-empty-icon">
                  💬
                </div>

                <h3>No messages yet</h3>

                <p>
                  Send a message to communicate
                  with the support agent.
                </p>

              </div>
            )}

            {messages.map((item) => (

              <div
                className="customer-message"
                key={item._id}
              >

                <div className="customer-message-avatar">
                  {(item.sender?.name ||
                    item.senderRole ||
                    "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="customer-message-content">

                  <div className="customer-message-header">

                    <strong>
                      {item.sender?.name ||
                        item.senderRole}
                    </strong>

                    <small>
                      {new Date(
                        item.createdAt
                      ).toLocaleString()}
                    </small>

                  </div>

                  <div className="customer-message-bubble">
                    {item.message}
                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* REPLY */}
        {ticket.status !== "Resolved" && (
          <div className="customer-ticket-card">

            <h2>Reply to Support</h2>

            <form
              className="customer-reply-form"
              onSubmit={sendMessage}
            >

              <label>
                Your Message
              </label>

              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                placeholder="Write your message..."
                rows="5"
              />

              <button
                className="customer-send-btn"
                type="submit"
                disabled={sending}
              >
                {sending
                  ? "Sending..."
                  : "Send Message"}
              </button>

            </form>

          </div>
        )}

        {/* RESOLVED */}
        {ticket.status === "Resolved" && (
          <div className="customer-ticket-card customer-resolved">

            <div className="customer-resolved-icon">
              ✓
            </div>

            <h2>Ticket Resolved</h2>

            <p>
              {ticket.resolutionNote ||
                "Your issue has been resolved by the support agent."}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default CustomerTicketDetails;