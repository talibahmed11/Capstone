import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div style={styles.container}>
      {/* Hero Image Section */}
      <header style={styles.hero}>
        <img
          src="/healthcare-banner.png"
          alt="Healthcare illustration"
          style={styles.heroImage}
        />
      </header>

      {/* Text and Buttons Section */}
      <section style={styles.heroTextSection}>
        <h1 style={styles.heroTitle}>Welcome to Road to Self-Care</h1>
        <p style={styles.heroSubtitle}>
          Your personalized health management starts here.
        </p>
        <div style={styles.buttonGroup}>
          <Link to="/Login" style={styles.primaryButton}>
            Log In
          </Link>
          <Link to="/register" style={styles.secondaryButton}>
            Sign Up
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <h2 style={styles.featuresTitle}>Features You’ll Love</h2>
        <div style={styles.features}>
          <div style={styles.featureCard}>
            <img
              src="https://img.icons8.com/fluency/96/appointment-reminders.png"
              alt="Reminders"
              style={styles.featureIcon}
            />
            <h3>Medication Reminders</h3>
            <p>Stay on track with timely refill and dose alerts.</p>
          </div>
          <div style={styles.featureCard}>
            <img
              src="https://img.icons8.com/fluency/96/medical-doctor.png"
              alt="Doctors"
              style={styles.featureIcon}
            />
            <h3>Doctor Tracker</h3>
            <p>Keep tabs on upcoming checkups and past visits.</p>
          </div>
          <div style={styles.featureCard}>
            <img
              src="https://img.icons8.com/fluency/96/checked.png"
              alt="Progress"
              style={styles.featureIcon}
            />
            <h3>Personalized Dashboard</h3>
            <p>Get a quick snapshot of your health plan in one place.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2025 Road to Self-Care. All rights reserved.</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    color: "#2c3e50",
    margin: 0,
    padding: 0,
  },
  hero: {
    width: "100%",
  },
  heroImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  heroTextSection: {
    padding: "40px 20px",
    textAlign: "center",
    backgroundColor: "#ffffff",
  },
  heroTitle: {
    fontSize: "3rem",
    marginBottom: "20px",
  },
  heroSubtitle: {
    fontSize: "1.3rem",
    marginBottom: "30px",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "#27ae60",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "1.1rem",
    textDecoration: "none",
    transition: "background-color 0.3s ease",
  },
  secondaryButton: {
    backgroundColor: "#34495e",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "1.1rem",
    textDecoration: "none",
    transition: "background-color 0.3s ease",
  },
  featuresSection: {
    padding: "60px 20px",
    backgroundColor: "#f8f9fa",
    textAlign: "center",
  },
  featuresTitle: {
    fontSize: "2.5rem",
    marginBottom: "40px",
  },
  features: {
    display: "flex",
    justifyContent: "center",
    gap: "50px",
    flexWrap: "wrap",
  },
  featureCard: {
    maxWidth: "250px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  featureIcon: {
    width: "80px",
    marginBottom: "15px",
  },
  footer: {
    padding: "20px",
    backgroundColor: "#2c3e50",
    color: "white",
    textAlign: "center",
  },
};

export default HomePage;
