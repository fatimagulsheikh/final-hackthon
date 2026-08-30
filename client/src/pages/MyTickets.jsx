import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function MyTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tickets/my");

      setTickets(response.data.tickets || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Resolved") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "In Progress") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    if (status === "Assigned") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    return {
      background: "#f3f4f6",
      color: "#374151",
    };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "32px",
              }}
            >
              My Tickets
            </h1>

            <p
              style={{
                color: "#64748b",
                marginTop: "8px",
              }}
            >
              Track and manage your support requests
            </p>
          </div>

          <button
            onClick={() => navigate("/customer")}
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#334155",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ← Dashboard
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              background: "#ffffff",
              padding: "40px",
              textAlign: "center",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ color: "#64748b" }}>
              Loading your tickets...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "15px 20px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && tickets.length === 0 && (
          <div
            style={{
              background: "#ffffff",
              padding: "50px 20px",
              textAlign: "center",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: "45px" }}>🎫</div>

            <h2 style={{ color: "#0f172a" }}>
              No tickets yet
            </h2>

            <p style={{ color: "#64748b" }}>
              You haven't created any support tickets.
            </p>

            <button
              onClick={() =>
                navigate("/customer/create-ticket")
              }
              style={{
                marginTop: "15px",
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              + Create Ticket
            </button>
          </div>
        )}

        {/* Ticket Cards */}
        {!loading && tickets.length > 0 && (
          <div
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  padding: "24px",
                  boxShadow:
                    "0 4px 15px rgba(15, 23, 42, 0.06)",
                  border: "1px solid #e2e8f0",
                }}
              >
                {/* Top Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      Ticket ID
                    </span>

                    <h3
                      style={{
                        margin: "4px 0 0",
                        color: "#2563eb",
                        fontSize: "20px",
                      }}
                    >
                      {ticket.ticketNumber}
                    </h3>
                  </div>

                  <span
                    style={{
                      ...getStatusStyle(ticket.status),
                      padding: "7px 13px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {ticket.status}
                  </span>
                </div>

                {/* Subject */}
                <h2
                  style={{
                    margin: "0 0 12px",
                    color: "#0f172a",
                    fontSize: "20px",
                  }}
                >
                  {ticket.subject}
                </h2>

                {/* Description */}
                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                    marginBottom: "20px",
                  }}
                >
                  {ticket.description}
                </p>

                {/* Details */}
                <div
                  style={{
                    display: "flex",
                    gap: "30px",
                    flexWrap: "wrap",
                    marginBottom: "20px",
                    paddingTop: "15px",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <div>
                    <small style={{ color: "#94a3b8" }}>
                      Category
                    </small>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontWeight: "600",
                        color: "#334155",
                      }}
                    >
                      {ticket.category}
                    </p>
                  </div>

                  <div>
                    <small style={{ color: "#94a3b8" }}>
                      Priority
                    </small>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontWeight: "600",
                        color: "#334155",
                      }}
                    >
                      {ticket.priority}
                    </p>
                  </div>

                  <div>
                    <small style={{ color: "#94a3b8" }}>
                      Agent
                    </small>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontWeight: "600",
                        color: "#334155",
                      }}
                    >
                      {ticket.assignedAgent?.name ||
                        "Not assigned"}
                    </p>
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={() =>
                    navigate(
                      `/customer/ticket/${ticket._id}`
                    )
                  }
                  style={{
                    width: "100%",
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    padding: "12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "15px",
                  }}
                >
                  View Ticket →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTickets;