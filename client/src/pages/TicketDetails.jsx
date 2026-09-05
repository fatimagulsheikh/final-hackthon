import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";
import api from "../api";
import "./TicketDetails.css";

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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
            data.resolutionNote || prev.resolutionNote,
        }));
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("ticket-status-updated", handleStatusUpdate);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("ticket-status-updated", handleStatusUpdate);
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
      await fetchMessages();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  const assignTicket = async () => {
    try {
      setError("");

      await api.patch(`/tickets/${id}/assign`);

      await fetchTicket();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to assign ticket"
      );
    }
  };

  const changeStatus = async () => {
    try {
      setError("");

      await api.patch(`/tickets/${id}/status`, {
        status: "In Progress",
      });

      await fetchTicket();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  const resolveTicket = async () => {
    if (!resolutionNote.trim()) {
      setError("Please enter a resolution note first.");
      return;
    }

    try {
      setError("");

      await api.patch(`/tickets/${id}/resolve`, {
        resolutionNote: resolutionNote.trim(),
      });

      setResolutionNote("");
      await fetchTicket();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to resolve ticket"
      );
    }
  };

  if (loading) {
    return (
      <div className="ticket-loading">
        <div className="loader"></div>
        <p>Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-not-found">
        <h2>Ticket not found</h2>
        <button onClick={() => navigate("/agent")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="ticket-page">

      {/* TOP NAV */}
      <div className="ticket-topbar">
        <button
          className="back-btn"
          onClick={() => navigate("/agent")}
        >
          ← Back to Dashboard
        </button>

        <div className="brand">
          <span>Support</span>Flow
        </div>
      </div>

      <main className="ticket-container">

        {/* HEADER */}
        <div className="ticket-header">

          <div>
            <p className="ticket-label">
              SUPPORT TICKET
            </p>

            <h1>{ticket.subject}</h1>

            <p className="ticket-number">
              Ticket ID: {ticket.ticketNumber}
            </p>
          </div>

          <span
            className={`status-badge status-${ticket.status
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {ticket.status}
          </span>

        </div>

        {/* ERROR */}
        {error && (
          <div className="error-box">
            ⚠️ {error}
          </div>
        )}

        {/* INFO CARDS */}
        <div className="info-grid">

          <div className="info-card">
            <span>Customer</span>
            <strong>
              {ticket.customer?.name || "Unknown"}
            </strong>
          </div>

          <div className="info-card">
            <span>Category</span>
            <strong>{ticket.category}</strong>
          </div>

          <div className="info-card">
            <span>Priority</span>
            <strong>{ticket.priority}</strong>
          </div>

          <div className="info-card">
            <span>Email</span>
            <strong>
              {ticket.customer?.email || "N/A"}
            </strong>
          </div>

        </div>

        {/* DESCRIPTION */}
        <section className="ticket-card">

          <div className="section-title">
            <span className="section-icon">📋</span>
            <h2>Customer Description</h2>
          </div>

          <p className="description">
            {ticket.description}
          </p>

        </section>

        {/* CONVERSATION */}
        <section className="ticket-card">

          <div className="section-title">
            <span className="section-icon">💬</span>

            <div>
              <h2>Conversation</h2>
              <p>Communication with the customer</p>
            </div>

            <span className="message-count">
              {messages.length} Messages
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="empty-messages">
              <div className="empty-icon">💬</div>

              <h3>No messages yet</h3>

              <p>
                Start the conversation with the
                customer.
              </p>
            </div>
          ) : (
            <div className="messages-list">

              {messages.map((item) => (
                <div
                  className="message-item"
                  key={item._id}
                >
                  <div className="message-avatar">
                    {(item.sender?.name ||
                      item.senderRole ||
                      "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="message-content">

                    <div className="message-top">
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

                    <p>{item.message}</p>

                  </div>
                </div>
              ))}

            </div>
          )}

        </section>

        {/* AGENT ACTIONS */}
        {ticket.status !== "Resolved" && (
          <div className="actions-grid">

            {/* REPLY */}
            <section className="action-card reply-card">

              <div className="action-header">
                <div className="action-icon blue">
                  💬
                </div>

                <div>
                  <h2>Reply to Customer</h2>
                  <p>
                    Send a message to the customer
                  </p>
                </div>
              </div>

              <form onSubmit={sendMessage}>

                <label>Your Reply</label>

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Write your reply to the customer..."
                  rows="5"
                />

                <button
                  className="primary-btn"
                  type="submit"
                  disabled={sending}
                >
                  {sending
                    ? "Sending..."
                    : "Send Reply →"}
                </button>

              </form>

            </section>

            {/* STATUS */}
            <section className="action-card">

              <div className="action-header">
                <div className="action-icon purple">
                  🔄
                </div>

                <div>
                  <h2>Update Status</h2>
                  <p>
                    Change the ticket progress
                  </p>
                </div>
              </div>

              {ticket.status === "New" && (
                <button
                  className="purple-btn"
                  onClick={assignTicket}
                >
                  Assign Ticket
                </button>
              )}

              {ticket.status === "Assigned" && (
                <button
                  className="purple-btn"
                  onClick={changeStatus}
                >
                  Mark In Progress
                </button>
              )}

              {ticket.status === "In Progress" && (
                <div className="current-status">
                  ✓ Ticket is currently In Progress
                </div>
              )}

            </section>

            {/* RESOLVE */}
            <section className="action-card resolve-card">

              <div className="action-header">
                <div className="action-icon green">
                  ✓
                </div>

                <div>
                  <h2>Resolve Ticket</h2>
                  <p>
                    Close this ticket after solving
                    the issue
                  </p>
                </div>
              </div>

              <label>Resolution Note</label>

              <textarea
                value={resolutionNote}
                onChange={(e) =>
                  setResolutionNote(e.target.value)
                }
                placeholder="Explain how the issue was resolved..."
                rows="4"
              />

              <button
                className="resolve-btn"
                onClick={resolveTicket}
              >
                ✓ Resolve Ticket
              </button>

            </section>

          </div>
        )}

        {/* RESOLVED */}
        {ticket.status === "Resolved" && (
          <section className="resolved-card">

            <div className="resolved-icon">
              ✓
            </div>

            <div>
              <h2>Ticket Resolved</h2>

              <p>
                {ticket.resolutionNote ||
                  "This ticket has been successfully resolved."}
              </p>
            </div>

          </section>
        )}

      </main>
    </div>
  );
}

export default TicketDetails;