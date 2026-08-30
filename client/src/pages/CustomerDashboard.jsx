import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get("/tickets/my");
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.log("Failed to load tickets:", error);
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
            Customer Support Portal
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

      {/* Main Content */}
      <main
        style={{
          maxWidth: "1100px",
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
            Welcome, {user?.name || "Customer"} 👋
          </h1>

          <p
            style={{
              marginBottom: 0,
              opacity: 0.9,
            }}
          >
            Need help? Create a support ticket and our
            support team will assist you.
          </p>
        </section>

        {/* Action Buttons */}
        <section
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <button
            onClick={() =>
              navigate("/customer/create-ticket")
            }
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              padding: "14px 22px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            + Create Support Ticket
          </button>

          <button
            onClick={() => navigate("/customer/tickets")}
            style={{
              backgroundColor: "#ffffff",
              color: "#2563eb",
              border: "1px solid #2563eb",
              padding: "14px 22px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            📋 My Tickets
          </button>
        </section>

        {/* Statistics */}
        <h2 style={{ color: "#1e293b" }}>
          Ticket Overview
        </h2>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "35px",
          }}
        >
          {/* Total */}
          <div
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "14px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
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
              padding: "25px",
              borderRadius: "14px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
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

          {/* In Progress */}
          <div
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "14px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
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
              padding: "25px",
              borderRadius: "14px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
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

        {/* Recent Tickets */}
        <section>
          <h2 style={{ color: "#1e293b" }}>
            Recent Tickets
          </h2>

          {loading ? (
            <p>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <div
              style={{
                backgroundColor: "white",
                padding: "35px",
                borderRadius: "14px",
                textAlign: "center",
              }}
            >
              <h3>No tickets yet</h3>

              <p style={{ color: "#64748b" }}>
                Create your first support ticket to get
                help from our team.
              </p>

              <button
                onClick={() =>
                  navigate("/customer/create-ticket")
                }
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Create Ticket
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "15px",
              }}
            >
              {tickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket._id}
                  style={{
                    backgroundColor: "white",
                    padding: "22px",
                    borderRadius: "14px",
                    boxShadow:
                      "0 3px 12px rgba(0,0,0,0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "8px",
                      }}
                    >
                      {ticket.ticketNumber}
                    </h3>

                    <p
                      style={{
                        margin: "5px 0",
                        fontWeight: "bold",
                      }}
                    >
                      {ticket.subject}
                    </p>

                    <p
                      style={{
                        margin: "5px 0",
                        color: "#64748b",
                      }}
                    >
                      {ticket.category}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        padding: "7px 12px",
                        borderRadius: "20px",
                        backgroundColor:
                          ticket.status === "Resolved"
                            ? "#dcfce7"
                            : ticket.status === "New"
                            ? "#fef3c7"
                            : "#dbeafe",
                        color:
                          ticket.status === "Resolved"
                            ? "#15803d"
                            : ticket.status === "New"
                            ? "#b45309"
                            : "#1d4ed8",
                        fontSize: "13px",
                        fontWeight: "bold",
                      }}
                    >
                      {ticket.status}
                    </span>

                    <button
                      onClick={() =>
                        navigate(
                          `/customer/ticket/${ticket._id}`
                        )
                      }
                      style={{
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "9px 15px",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      View
                    </button>
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

export default CustomerDashboard;