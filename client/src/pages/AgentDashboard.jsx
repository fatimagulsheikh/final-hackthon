import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./AgentDashboard.css";

function AgentDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

  const filteredTickets = tickets.filter((ticket) => {
    const text = `
      ${ticket.ticketNumber}
      ${ticket.subject}
      ${ticket.customer?.name || ""}
      ${ticket.category}
      ${ticket.status}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const getStatusClass = (status) => {
    if (status === "New") return "status-new";
    if (status === "Assigned") return "status-assigned";
    if (status === "In Progress") return "status-progress";
    if (status === "Resolved") return "status-resolved";

    return "";
  };

  return (
    <div className="agent-page">

      {/* NAVBAR */}
      <nav className="agent-navbar">
        <div className="brand-area">
          <div className="brand-icon">S</div>

          <div>
            <h2>SupportFlow</h2>
            <span>Agent Support Desk</span>
          </div>
        </div>

        <div className="nav-right">
          <div className="agent-profile">
            <div className="profile-avatar">
              {(user?.name || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="profile-info">
              <strong>{user?.name || "Support Agent"}</strong>
              <span>Support Agent</span>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="agent-container">

        {/* HERO */}
        <section className="agent-hero">
          <div>
            <span className="hero-label">
              SUPPORT CENTER
            </span>

            <h1>
              Agent Dashboard 👋
            </h1>

            <p>
              Welcome back,{" "}
              <strong>
                {user?.name || "Support Agent"}
              </strong>
              . Manage customer requests and provide
              excellent support.
            </p>
          </div>

          <div className="hero-icon">
            🎧
          </div>
        </section>

        {/* STATISTICS */}
        <div className="section-heading">
          <div>
            <h2>Overview</h2>
            <p>Monitor your support activity</p>
          </div>
        </div>

        <section className="stats-grid">

          <div className="stat-card total-card">
            <div className="stat-icon">📊</div>
            <div>
              <span>Total Tickets</span>
              <h3>{totalTickets}</h3>
            </div>
          </div>

          <div className="stat-card new-card">
            <div className="stat-icon">🆕</div>
            <div>
              <span>New</span>
              <h3>{newTickets}</h3>
            </div>
          </div>

          <div className="stat-card assigned-card">
            <div className="stat-icon">👤</div>
            <div>
              <span>Assigned</span>
              <h3>{assignedTickets}</h3>
            </div>
          </div>

          <div className="stat-card progress-card">
            <div className="stat-icon">⚡</div>
            <div>
              <span>In Progress</span>
              <h3>{inProgressTickets}</h3>
            </div>
          </div>

          <div className="stat-card resolved-card">
            <div className="stat-icon">✓</div>
            <div>
              <span>Resolved</span>
              <h3>{resolvedTickets}</h3>
            </div>
          </div>

        </section>

        {/* TICKETS HEADER */}
        <section className="tickets-section">

          <div className="tickets-header">

            <div>
              <h2>Customer Tickets</h2>
              <p>
                Manage and respond to customer support requests
              </p>
            </div>

            <button
              className="refresh-btn"
              onClick={fetchTickets}
            >
              ↻ Refresh
            </button>

          </div>

          {/* SEARCH */}
          <div className="search-wrapper">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search by ticket number, subject, customer..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          {loading && (
            <div className="loading-box">
              <div className="loader"></div>
              <p>Loading customer tickets...</p>
            </div>
          )}

          {error && (
            <div className="error-box">
              ⚠️ {error}
            </div>
          )}

          {!loading &&
            !error &&
            filteredTickets.length === 0 && (
              <div className="empty-box">
                <div className="empty-icon">🎫</div>

                <h3>No tickets found</h3>

                <p>
                  No customer tickets match your search.
                </p>
              </div>
            )}

          {/* TICKET LIST */}
          {!loading &&
            !error &&
            filteredTickets.length > 0 && (
              <div className="ticket-list">

                {filteredTickets.map((ticket) => (

                  <article
                    className="ticket-card"
                    key={ticket._id}
                  >

                    <div className="ticket-main">

                      <div className="ticket-number">
                        {ticket.ticketNumber}
                      </div>

                      <h3>
                        {ticket.subject}
                      </h3>

                      <div className="ticket-details">

                        <div>
                          <span>Customer</span>
                          <strong>
                            {ticket.customer?.name ||
                              "Unknown"}
                          </strong>
                        </div>

                        <div>
                          <span>Category</span>
                          <strong>
                            {ticket.category}
                          </strong>
                        </div>

                        <div>
                          <span>Priority</span>
                          <strong>
                            <span className="priority-dot">
                              ●
                            </span>{" "}
                            {ticket.priority}
                          </strong>
                        </div>

                      </div>

                    </div>

                    <div className="ticket-side">

                      <span
                        className={`status-badge ${getStatusClass(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>

                      <button
                        className="open-ticket-btn"
                        onClick={() =>
                          navigate(
                            `/agent/ticket/${ticket._id}`
                          )
                        }
                      >
                        Open Ticket
                        <span>→</span>
                      </button>

                    </div>

                  </article>

                ))}

              </div>
            )}

        </section>

      </main>
    </div>
  );
}

export default AgentDashboard;