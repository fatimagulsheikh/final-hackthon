import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function AgentDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tickets/agent");

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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const totalTickets = tickets.length;

  const newTickets = tickets.filter(
    (ticket) => ticket.status === "New"
  ).length;

  const assignedTickets = tickets.filter(
    (ticket) => ticket.status === "Assigned"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          backgroundColor: "#ffffff",
          padding: "18px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#2563eb",
            }}
          >
            SupportFlow
          </h2>

          <small style={{ color: "#64748b" }}>
            Agent Support Desk
          </small>
        </div>

        <button
          onClick={logout}
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </nav>

      {/* Main */}
      <main
        style={{
          maxWidth: "1150px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        {/* Welcome */}
        <section
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "35px",
            borderRadius: "16px",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ marginTop: 0 }}>
            Agent Dashboard 👋
          </h1>

          <p
            style={{
              marginBottom: 0,
              opacity: 0.9,
            }}
          >
            Welcome, {user?.name || "Support Agent"}.
            Manage customer tickets and provide support.
          </p>
        </section>

        {/* Statistics */}
        <h2 style={{ color: "#1e293b" }}>
          Ticket Statistics
        </h2>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
            marginBottom: "35px",
          }}
        >
          {/* Total */}
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "14px",
              boxShadow:
                "0 3px 12px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ color: "#64748b", margin: 0 }}>
              Total Tickets
            </p>

            <h2 style={{ marginBottom: 0 }}>
              {totalTickets}
            </h2>
          </div>

          {/* New */}
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "14px",
              boxShadow:
                "0 3px 12px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ color: "#64748b", margin: 0 }}>
              New
            </p>

            <h2
              style={{
                marginBottom: 0,
                color: "#f59e0b",
              }}
            >
              {newTickets}
            </h2>
          </div>

          {/* Assigned */}
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "14px",
              boxShadow:
                "0 3px 12px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ color: "#64748b", margin: 0 }}>
              Assigned
            </p>

            <h2
              style={{
                marginBottom: 0,
                color: "#7c3aed",
              }}
            >
              {assignedTickets}
            </h2>
          </div>

          {/* In Progress */}
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "14px",
              boxShadow:
                "0 3px 12px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ color: "#64748b", margin: 0 }}>
              In Progress
            </p>

            <h2
              style={{
                marginBottom: 0,
                color: "#2563eb",
              }}
            >
              {inProgressTickets}
            </h2>
          </div>

          {/* Resolved */}
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "14px",
              boxShadow:
                "0 3px 12px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ color: "#64748b", margin: 0 }}>
              Resolved
            </p>

            <h2
              style={{
                marginBottom: 0,
                color: "#16a34a",
              }}
            >
              {resolvedTickets}
            </h2>
          </div>
        </section>

        {/* Tickets */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2 style={{ color: "#1e293b" }}>
              Customer Tickets
            </h2>

            <button
              onClick={fetchTickets}
              style={{
                backgroundColor: "#ffffff",
                color: "#2563eb",
                border: "1px solid #2563eb",
                padding: "9px 15px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          </div>

          {loading && <p>Loading tickets...</p>}

          {error && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            tickets.length === 0 && (
              <div
                style={{
                  backgroundColor: "white",
                  padding: "35px",
                  borderRadius: "14px",
                  textAlign: "center",
                }}
              >
                <h3>No tickets found</h3>

                <p style={{ color: "#64748b" }}>
                  There are currently no customer tickets.
                </p>
              </div>
            )}

          {!loading && tickets.length > 0 && (
            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  style={{
                    backgroundColor: "white",
                    padding: "22px",
                    borderRadius: "14px",
                    boxShadow:
                      "0 3px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "flex-start",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: "#2563eb",
                          fontWeight: "bold",
                          margin: "0 0 8px",
                        }}
                      >
                        {ticket.ticketNumber}
                      </p>

                      <h3
                        style={{
                          margin: "0 0 10px",
                          color: "#1e293b",
                        }}
                      >
                        {ticket.subject}
                      </h3>

                      <p
                        style={{
                          margin: "6px 0",
                          color: "#64748b",
                        }}
                      >
                        <strong>Customer:</strong>{" "}
                        {ticket.customer?.name ||
                          "Unknown"}
                      </p>

                      <p
                        style={{
                          margin: "6px 0",
                          color: "#64748b",
                        }}
                      >
                        <strong>Category:</strong>{" "}
                        {ticket.category}
                      </p>

                      <p
                        style={{
                          margin: "6px 0",
                          color: "#64748b",
                        }}
                      >
                        <strong>Priority:</strong>{" "}
                        {ticket.priority}
                      </p>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "7px 12px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "bold",
                          backgroundColor:
                            ticket.status ===
                            "Resolved"
                              ? "#dcfce7"
                              : ticket.status ===
                                "New"
                              ? "#fef3c7"
                              : ticket.status ===
                                "Assigned"
                              ? "#ede9fe"
                              : "#dbeafe",
                          color:
                            ticket.status ===
                            "Resolved"
                              ? "#15803d"
                              : ticket.status ===
                                "New"
                              ? "#b45309"
                              : ticket.status ===
                                "Assigned"
                              ? "#6d28d9"
                              : "#1d4ed8",
                        }}
                      >
                        {ticket.status}
                      </span>

                      <br />

                      <button
                        onClick={() =>
                          navigate(
                            `/agent/ticket/${ticket._id}`
                          )
                        }
                        style={{
                          marginTop: "15px",
                          backgroundColor: "#2563eb",
                          color: "white",
                          border: "none",
                          padding: "10px 18px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Open Ticket
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AgentDashboard;
