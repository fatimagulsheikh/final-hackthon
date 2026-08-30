import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function CreateTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "General",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.post("/tickets", formData);

      setMessage(
        `Ticket created successfully! Ticket Number: ${response.data.ticket.ticketNumber}`
      );

      setFormData({
        subject: "",
        description: "",
        category: "General",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eef2ff, #f8fafc)",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/customer")}
          style={{
            border: "none",
            background: "transparent",
            color: "#4f46e5",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          ← Back to Dashboard
        </button>

        {/* Main Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "35px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.10)",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "13px",
                background: "#4f46e5",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "15px",
              }}
            >
              🎫
            </div>

            <h1
              style={{
                margin: "0",
                color: "#111827",
                fontSize: "30px",
              }}
            >
              Create Support Ticket
            </h1>

            <p
              style={{
                color: "#6b7280",
                marginTop: "8px",
              }}
            >
              Tell us about your issue and our support team
              will help you.
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div
              style={{
                background: "#ecfdf5",
                color: "#047857",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "22px",
                border: "1px solid #a7f3d0",
              }}
            >
              <strong>✓ Success</strong>
              <div style={{ marginTop: "5px" }}>
                {message}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "22px",
                border: "1px solid #fecaca",
              }}
            >
              <strong>⚠ Error</strong>
              <div style={{ marginTop: "5px" }}>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Subject */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#374151",
                  fontWeight: "600",
                }}
              >
                Subject
              </label>

              <input
                type="text"
                name="subject"
                placeholder="e.g. Charged twice for my order"
                value={formData.subject}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "9px",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#374151",
                  fontWeight: "600",
                }}
              >
                Describe Your Issue
              </label>

              <textarea
                name="description"
                placeholder="Please describe your problem in detail..."
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "9px",
                  fontSize: "15px",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "Arial, sans-serif",
                }}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#374151",
                  fontWeight: "600",
                }}
              >
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "9px",
                  fontSize: "15px",
                  background: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <option value="General">General</option>
                <option value="Billing">Billing</option>
                <option value="Technical">Technical</option>
                <option value="Account">Account</option>
                <option value="Order">Order</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                border: "none",
                borderRadius: "9px",
                background: loading ? "#9ca3af" : "#4f46e5",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading
                ? "Creating Ticket..."
                : "Create Support Ticket"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateTicket;
