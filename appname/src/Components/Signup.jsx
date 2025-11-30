import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";
import loginBg from "../assets/login.jpg";

const API_BASE_URL = "http://localhost:5000";

export default function Signup() {
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !pass || !confirm) {
      setError("Please fill in all fields");
      return;
    }

    if (pass !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        name,
        email,
        password: pass,
        role,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ ROLE BASED REDIRECT (UPDATED)
      if (user.role === "student") {
        navigate("/student");
      } else if (user.role === "teacher") {
        navigate("/mentor");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="signup-bg"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="signup-card">
        <h2 className="signup-title">Create an Account ✨</h2>
        <p className="signup-subtitle">Join as student or teacher</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          
          {/* ROLE TOGGLE */}
          <div className="role-toggle">
            <button
              type="button"
              className={role === "student" ? "role-btn active" : "role-btn"}
              onClick={() => setRole("student")}
            >
              Student
            </button>
            <button
              type="button"
              className={role === "teacher" ? "role-btn active" : "role-btn"}
              onClick={() => setRole("teacher")}
            >
              Teacher
            </button>
          </div>

          {/* NAME */}
          <label className="signup-label">
            Full Name
            <input
              type="text"
              className="signup-input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {/* EMAIL */}
          <label className="signup-label">
            Email
            <input
              type="email"
              className="signup-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {/* PASSWORD */}
          <label className="signup-label">
            Password
            <input
              type="password"
              className="signup-input"
              placeholder="Create a password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </label>

          {/* CONFIRM PASSWORD */}
          <label className="signup-label">
            Confirm Password
            <input
              type="password"
              className="signup-input"
              placeholder="Confirm your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="signup-btn-main"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {error && <p className="error-message">{error}</p>}

          <p className="signup-footer">
            Already have an account?
            <span onClick={() => navigate("/login")}> Login</span>
          </p>
        </form>
      </div>
    </div>
  );
}
