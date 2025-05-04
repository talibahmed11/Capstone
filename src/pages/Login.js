import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:5000/login", formData);
      const token = response.data.access_token;

      // ✅ Save token
      localStorage.setItem("token", token);
      console.log("🔐 Saved token:", token); // ✅ Debug log

      setMessage("✅ Login successful!");
      onLogin(); // Update navbar
      navigate("/"); // Redirect to homepage
    } catch (error) {
      const errMsg = error.response?.data?.message || "Login failed. Try again.";
      setMessage("❌ " + errMsg);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login to Road to Self-Care</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
        {message && (
          <p style={{ marginTop: "15px", color: message.startsWith("✅") ? "green" : "red" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "100%",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    color: "#2c3e50",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Login;
