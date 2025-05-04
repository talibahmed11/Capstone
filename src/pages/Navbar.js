import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>Road to Self-Care</div>

      <div style={styles.hamburger} onClick={toggleMenu}>
        ☰
      </div>

      <div style={{ ...styles.linksContainer, display: menuOpen ? "flex" : "none" }}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/add-medication" style={styles.link}>Medications</Link>
        <Link to="/doctors" style={styles.link}>Doctors</Link>
        <Link to="/reminders" style={styles.link}>Reminders</Link>
        {!token && (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
        {token && (
          <div style={styles.userSection}>
            <span style={styles.userIcon}>👤</span>
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#2c3e50",
    color: "#fff",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
    height: "60px",
  },
  brand: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  hamburger: {
    fontSize: "24px",
    cursor: "pointer",
    display: "block",
  },
  linksContainer: {
    position: "absolute",
    top: "60px",
    left: 0,
    right: 0,
    backgroundColor: "#34495e",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "10px 20px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    margin: "8px 0",
    fontSize: "16px",
    display: "block",
  },
  userSection: {
    marginTop: "10px",
    display: "flex",
    alignItems: "center",
  },
  userIcon: {
    fontSize: "18px",
    marginRight: "10px",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "6px 12px",
    cursor: "pointer",
  },
};

export default Navbar;
