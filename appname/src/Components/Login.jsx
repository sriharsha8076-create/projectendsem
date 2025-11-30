import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import loginBg from "../assets/login.jpg";

const API_BASE_URL = "http://localhost:5000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ success message from signup
  const successMessage = location.state?.success;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = res.data;

      // ✅ Save auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Go to dashboard and clear state
      if (user.role === "student") {
  navigate("/student", { replace: true });
} else if (user.role === "teacher") {
  navigate("/mentor", { replace: true });
}

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-bg"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="login-card">
        <h2 className="login-title">Welcome Back 👋</h2>
        <p className="login-subtitle">Login to access your portal</p>

        {/* ✅ SUCCESS MESSAGE */}
        {successMessage && (
          <p style={{
            background: "#e8f5e9",
            color: "#2e7d32",
            padding: "10px",
            borderRadius: "8px",
            textAlign: "center",
            fontSize: "0.9rem",
            marginBottom: "12px",
            fontWeight: "600"
          }}>
            {successMessage}
          </p>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            Email
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="login-label">
            Password
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            className="signup-btn"
            onClick={() => navigate("/signup")}
          >
            Create Account
          </button>

          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
