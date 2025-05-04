import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddMedication from "./pages/AddMedication";
import Reminders from "./pages/Reminders";

// Navbar Component
function Navbar({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>
      <div>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/add-medication" style={styles.link}>Add Medication</Link>
        <Link to="/reminders" style={styles.link}>Reminders</Link>
        {!isLoggedIn && (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
      {isLoggedIn && (
        <div style={styles.userSection}>
          <span style={styles.userIcon}>👤</span>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      )}
    </nav>
  );
}

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} onLogout={() => setIsLoggedIn(false)} />
      <div style={styles.pageWrapper}> {/* ✅ This adds global padding */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-medication" element={<AddMedication />} />
          <Route path="/reminders" element={<Reminders />} />
        </Routes>
      </div>
    </Router>
  );
}

// Simple styles for navigation bar and padding
const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 30px",
    backgroundColor: "#2c3e50",
    color: "#fff",
    alignItems: "center",
    height: "60px", // ✅ ensure consistent height
  },
  link: {
    marginRight: "15px",
    color: "#fff",
    textDecoration: "none",
    fontSize: "16px",
  },
  userSection: {
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
  pageWrapper: {
    paddingTop: "80px", // ✅ push all pages below the fixed navbar
  },
};

export default App;
