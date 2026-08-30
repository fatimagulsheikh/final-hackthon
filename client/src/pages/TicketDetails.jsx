import socket from "../socket";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";


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

    // ===============================
    // NEW MESSAGE REAL-TIME
    // ===============================
    const handleNewMessage = (newMessage) => {
      setMessages((previousMessages) => {
        // Duplicate message prevent karna
        const alreadyExists = previousMessages.some(
          (item) => item._id === newMessage._id
        );

        if (alreadyExists) {
          return previousMessages;
        }

        return [...previousMessages, newMessage];
      });
    };

    // ===============================
    // TICKET STATUS REAL-TIME
    // ===============================
    const handleStatusUpdate = (data) => {
      if (data.ticketId === id) {
        setTicket((previousTicket) => ({
          ...previousTicket,
          status: data.status,
          resolutionNote:
            data.resolutionNote ||
            previousTicket.resolutionNote,
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

  const changeStatus = async (newStatus) => {
    try {
      await api.patch(`/tickets/${id}/status`, {
        status: newStatus,
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
      setError("Resolution note is required");
      return;
    }

    try {
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
    return <p>Loading ticket...</p>;
  }

  if (!ticket) {
    return <p>Ticket not found.</p>;
  }

  return (
    <div>
      <button onClick={() => navigate("/agent")}>
        ← Back to Dashboard
      </button>

      <h1>{ticket.ticketNumber}</h1>

      {error && <p>{error}</p>}

      <h2>{ticket.subject}</h2>

      <p>
        <strong>Customer:</strong>{" "}
        {ticket.customer?.name}
      </p>

      <p>
        <strong>Email:</strong>{" "}
        {ticket.customer?.email}
      </p>

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

      <h3>Customer Description</h3>

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
            {new Date(item.createdAt).toLocaleString()}
          </small>

          <hr />
        </div>
      ))}

      {ticket.status !== "Resolved" && (
        <>
          <h3>Reply to Customer</h3>

          <form onSubmit={sendMessage}>
            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Write your reply..."
              rows="4"
            />

            <br />

            <button
              type="submit"
              disabled={sending}
            >
              {sending
                ? "Sending..."
                : "Send Reply"}
            </button>
          </form>

          <hr />

          <h3>Update Status</h3>

          <button
            onClick={() => changeStatus("In Progress")}
          >
            Mark In Progress
          </button>

          <hr />

          <h3>Resolve Ticket</h3>

          <textarea
            value={resolutionNote}
            onChange={(e) =>
              setResolutionNote(e.target.value)
            }
            placeholder="Enter resolution note..."
            rows="4"
          />

          <br />

          <button onClick={resolveTicket}>
            Resolve Ticket
          </button>
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


export default TicketDetails;