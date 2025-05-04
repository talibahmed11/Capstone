import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDoctor();
    // eslint-disable-next-line
  }, []);

  const fetchDoctor = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctor(response.data);
      setNotes(response.data.notes || "");
    } catch (err) {
      console.error("Error fetching doctor:", err);
      setMessage("❌ Could not load doctor profile.");
    }
  };

  const updateNotes = async () => {
    try {
      await axios.put(
        `http://127.0.0.1:5000/doctors/${id}/notes`,
        { notes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("✅ Notes updated successfully.");
    } catch (err) {
      console.error("Error updating notes:", err);
      setMessage("❌ Failed to update notes.");
    }
  };

  if (!doctor) return <p style={styles.loading}>Loading doctor details...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{doctor.name}</h2>
      <div style={styles.detailGroup}>
        <p><strong>Specialty:</strong> {doctor.specialty || "N/A"}</p>
        <p><strong>First Seen:</strong> {doctor.first_seen || "N/A"}</p>
        <p><strong>Next Scheduled Visit:</strong> {doctor.next_schedule || "N/A"}</p>
        <p><strong>Status:</strong> {doctor.is_active ? "✅ Active" : "❌ Inactive"}</p>
      </div>

      <h3 style={styles.sectionTitle}>Personal Notes</h3>
      <textarea
        rows="6"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add any notes about this doctor..."
        style={styles.textarea}
      />
      <button onClick={updateNotes} style={styles.button}>💾 Save Notes</button>

      {message && <p style={styles.message}>{message}</p>}

      <button onClick={() => navigate("/doctors")} style={styles.backButton}>
        ← Back to Doctors
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "28px",
    color: "#2c3e50",
    marginBottom: "20px",
    borderBottom: "2px solid #ccc",
    paddingBottom: "10px",
  },
  detailGroup: {
    marginBottom: "20px",
    fontSize: "16px",
    lineHeight: "1.6",
  },
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "10px",
    marginTop: "20px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    resize: "vertical",
    marginBottom: "10px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "white",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },
  backButton: {
    padding: "8px 16px",
    backgroundColor: "#3498db",
    color: "white",
    fontSize: "14px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "20px",
    fontWeight: "bold",
  },
  message: {
    marginTop: "10px",
    color: "#2c3e50",
    fontStyle: "italic",
  },
  loading: {
    fontFamily: "Segoe UI, sans-serif",
    textAlign: "center",
    marginTop: "50px",
  },
};

export default DoctorProfile;
