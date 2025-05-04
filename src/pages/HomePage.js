import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <header style={styles.header}>
        <img
          src="https://images.unsplash.com/photo-1597764699510-68d8b62a3a4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80"
          alt="Self-Care Banner"
          style={styles.banner}
        />
        <div style={styles.overlay}>
          <h1 style={styles.title}>Your Journey to Better Health Starts Here</h1>
          <p style={styles.subtitle}>Stay organized. Stay healthy. Stay inspired.</p>
          <div style={styles.buttonGroup}>
            <Link to="/dashboard" style={styles.primaryButton}>Go to Dashboard</Link>
            <Link to="/register" style={styles.secondaryButton}>Get Started</Link>
          </div>
        </div>
        <div style={styles.fade}></div>
      </header>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <h2 style={styles.featuresTitle}>Why Choose Us?</h2>
        <div style={styles.features}>
          <div style={styles.featureBox}>
            <img src="https://img.icons8.com/fluency/96/meditation.png" alt="Wellness" style={styles.featureIcon} />
            <h3 style={styles.featureText}>Personal Wellness</h3>
          </div>
          <div style={styles.featureBox}>
            <img src="https://img.icons8.com/fluency/96/appointment-reminders.png" alt="Reminders" style={styles.featureIcon} />
            <h3 style={styles.featureText}>Smart Reminders</h3>
          </div>
          <div style={styles.featureBox}>
            <img src="https://img.icons8.com/fluency/96/medical-doctor.png" alt="Support" style={styles.featureIcon} />
            <h3 style={styles.featureText}>Professional Support</h3>
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
    fontFamily: 'Arial, sans-serif',
    color: '#2c3e50',
    textAlign: 'center',
    paddingTop: '80px', // ✅ offsets fixed navbar
  },
  header: {
    position: 'relative',
    height: '80vh',
    width: '100%',
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'brightness(65%)',
  },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    textAlign: 'center',
    zIndex: 2,
    padding: '20px',
  },
  fade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80px',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0), #f8f9fa)',
    zIndex: 1,
  },
  title: {
    fontSize: '3rem',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.3rem',
    marginBottom: '30px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    display: 'inline-block',
    padding: '12px 24px',
    fontSize: '1.1rem',
    backgroundColor: '#27ae60',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease',
  },
  secondaryButton: {
    display: 'inline-block',
    padding: '12px 24px',
    fontSize: '1.1rem',
    backgroundColor: '#2c3e50',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease',
  },
  featuresSection: {
    padding: '60px 20px',
    backgroundColor: '#f8f9fa',
  },
  featuresTitle: {
    fontSize: '2.5rem',
    marginBottom: '40px',
  },
  features: {
    display: 'flex',
    justifyContent: 'center',
    gap: '50px',
    flexWrap: 'wrap',
  },
  featureBox: {
    maxWidth: '200px',
    textAlign: 'center',
  },
  featureIcon: {
    width: '100px',
    height: '100px',
    marginBottom: '15px',
  },
  featureText: {
    fontSize: '1.2rem',
  },
  footer: {
    padding: '20px',
    backgroundColor: '#2c3e50',
    color: 'white',
    marginTop: '40px',
  },
};

export default HomePage;
