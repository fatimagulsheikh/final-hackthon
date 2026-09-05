import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./CustomerDashboard.css";

function CustomerDashboard() {
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

  const getStatusClass = (status) => {
    if (status === "New") return "customer-status-new";
    if (status === "In Progress")
      return "customer-status-progress";
    if (status === "Resolved")
      return "customer-status-resolved";
    if (status === "Assigned")
      return "customer-status-assigned";

    return "";
  };

  return (
    <div className="customer-dashboard">

      {/* NAVBAR */}
      <nav className="customer-navbar">

        <div className="customer-brand">
          <div className="customer-brand-icon">
            S
          </div>

          <div>
            <h2>SupportFlow</h2>
            <span>Customer Support Portal</span>
          </div>
        </div>

        <div className="customer-nav-right">

          <div className="customer-profile">
            <div className="customer-avatar">
              {(user?.name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="customer-profile-info">
              <strong>
                {user?.name || "Customer"}
              </strong>

              <span>Customer</span>
            </div>
          </div>

          <button
            className="customer-logout"
            onClick={logout}
          >
            Logout
          </button>

        </div>
      </nav>

      {/* MAIN */}
      <main className="customer-container">

        {/* HERO */}
        <section className="customer-hero">

          <div className="customer-hero-content">

            <span className="customer-hero-label">
              CUSTOMER SUPPORT
            </span>

            <h1>
              Welcome,{" "}
              {user?.name || "Customer"} 👋
            </h1>

            <p>
              Need help? Create a support ticket and
              our support team will assist you.
            </p>

            <div className="customer-hero-buttons">

              <button
                className="create-ticket-btn"
                onClick={() =>
                  navigate("/customer/create-ticket")
                }
              >
                <span>＋</span>
                Create Support Ticket
              </button>

              <button
                className="my-tickets-btn"
                onClick={() =>
                  navigate("/customer/tickets")
                }
              >
                📋 My Tickets
              </button>

            </div>

          </div>

          <div className="customer-hero-graphic">
            <div className="hero-circle">
              🎧
            </div>
          </div>

        </section>

        {/* OVERVIEW */}
        <section className="customer-overview">

          <div className="customer-section-title">
            <div>
              <h2>Ticket Overview</h2>
              <p>
                Track the progress of your support requests
              </p>
            </div>
          </div>

          <div className="customer-stats">

            <div className="customer-stat-card">
              <div className="customer-stat-icon total">
                🎫
              </div>

              <div>
                <span>Total Tickets</span>
                <h3>{totalTickets}</h3>
              </div>
            </div>

            <div className="customer-stat-card">
              <div className="customer-stat-icon new">
                🆕
              </div>

              <div>
                <span>New</span>
                <h3>{newTickets}</h3>
              </div>
            </div>

            <div className="customer-stat-card">
              <div className="customer-stat-icon progress">
                ⚡
              </div>

              <div>
                <span>In Progress</span>
                <h3>{inProgressTickets}</h3>
              </div>
            </div>

            <div className="customer-stat-card">
              <div className="customer-stat-icon resolved">
                ✓
              </div>

              <div>
                <span>Resolved</span>
                <h3>{resolvedTickets}</h3>
              </div>
            </div>

          </div>

        </section>

        {/* RECENT TICKETS */}
        <section className="recent-tickets">

          <div className="recent-header">

            <div>
              <h2>Recent Tickets</h2>
              <p>
                View and track your latest support requests
              </p>
            </div>

            <button
              className="view-all-btn"
              onClick={() =>
                navigate("/customer/tickets")
              }
            >
              View All →
            </button>

          </div>

          {loading && (
            <div className="customer-loading">
              <div className="customer-loader"></div>
              <p>Loading your tickets...</p>
            </div>
          )}

          {error && (
            <div className="customer-error">
              ⚠️ {error}
            </div>
          )}

          {!loading &&
            !error &&
            tickets.length === 0 && (
              <div className="customer-empty">
                <div className="customer-empty-icon">
                  🎫
                </div>

                <h3>No tickets yet</h3>

                <p>
                  Create your first support ticket and
                  our team will help you.
                </p>

                <button
                  onClick={() =>
                    navigate("/customer/create-ticket")
                  }
                >
                  Create Your First Ticket
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            tickets.length > 0 && (
              <div className="customer-ticket-list">

                {tickets.slice(0, 5).map((ticket) => (

                  <div
                    className="customer-ticket-row"
                    key={ticket._id}
                  >

                    <div className="customer-ticket-info">

                      <span className="customer-ticket-number">
                        {ticket.ticketNumber}
                      </span>

                      <h3>{ticket.subject}</h3>

                      <div className="customer-ticket-meta">

                        <span>
                          {ticket.category}
                        </span>

                        <span className="meta-divider">
                          •
                        </span>

                        <span>
                          Priority: {ticket.priority}
                        </span>

                      </div>

                    </div>

                    <div className="customer-ticket-action">

                      <span
                        className={`customer-status ${getStatusClass(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>

                      <button
                        onClick={() =>
                          navigate(
                            `/customer/ticket/${ticket._id}`
                          )
                        }
                      >
                        View
                        <span>→</span>
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