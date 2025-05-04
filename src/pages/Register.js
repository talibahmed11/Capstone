import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:5000/register", formData);
      setMessage("✅ Registered successfully! Check your email.");
    } catch (error) {
      console.log("Full error:", error.response); // helpful for debugging
      const errorMsg = error.response?.data?.message || error.message;
      setMessage("❌ Registration failed: " + errorMsg);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Full Name"
          value={formData.username}
          onChange={handleChange}
          required
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
          }}
        >
          Register
        </button>
      </form>
      {message && (
        <p style={{ marginTop: "15px", color: message.startsWith("✅") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Register;
