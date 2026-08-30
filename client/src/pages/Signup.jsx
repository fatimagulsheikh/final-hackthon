import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      const response = await api.post("/auth/signup", formData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      if (response.data.user.role === "agent") {
        navigate("/agent");
      } else {
        navigate("/customer");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #eef2ff, #f8fafc)",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#ffffff",
          padding: "40px",
          borderRadius: "18px",
          boxShadow: "0 15px 40px rgba(0,0,0,0.10)",
        }}
      >
        {/* Logo / Heading */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              width: "55px",
              height: "55px",
              margin: "0 auto 15px",
              borderRadius: "14px",
              background: "#4f46e5",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "25px",
              fontWeight: "bold",
            }}
          >
            S
          </div>

          <h1
            style={{
              margin: "0",
              color: "#111827",
              fontSize: "28px",
            }}
          >
            SupportFlow
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginTop: "8px",
              marginBottom: "0",
            }}
          >
            Create your support account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#dc2626",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#374151",
                fontWeight: "600",
              }}
            >
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                border: "1px solid #d1d5db",
                borderRadius: "9px",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#374151",
                fontWeight: "600",
              }}
            >
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                border: "1px solid #d1d5db",
                borderRadius: "9px",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#374151",
                fontWeight: "600",
              }}
            >
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                border: "1px solid #d1d5db",
                borderRadius: "9px",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {/* Role */}
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#374151",
                fontWeight: "600",
              }}
            >
              Account Type
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "13px",
                border: "1px solid #d1d5db",
                borderRadius: "9px",
                fontSize: "15px",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option value="customer">Customer</option>
              <option value="agent">Support Agent</option>
            </select>
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "9px",
              background: loading ? "#9ca3af" : "#4f46e5",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          Already have an account?

          <button
            onClick={() => navigate("/login")}
            style={{
              marginLeft: "6px",
              border: "none",
              background: "none",
              color: "#4f46e5",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
