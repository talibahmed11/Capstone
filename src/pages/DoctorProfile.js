import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDoctor();
  }, []);

  const fetchDoctor = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/doctors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      await axios.put(`http://127.0.0.1:5000/doctors/${id}/notes`, { notes }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("✅ Notes updated successfully.");
    } catch (err) {
      console.error("Error updating notes:", err);
      setMessage("❌ Failed to update notes.");
    }
  };

  if (!doctor) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h2>{doctor.name}</h2>
      <p><strong>Specialty:</strong> {doctor.specialty}</p>
      <p><strong>First Seen:</strong> {doctor.first_seen}</p>
      <p><strong>Next Appointment:</strong> {doctor.next_appointment}</p>
      <p><strong>Status:</strong> {doctor.is_active ? "Active" : "Inactive"}</p>

      <h3>Notes</h3>
      <textarea
        rows="6"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={styles.textarea}
      />
      <button style={styles.button} onClick={updateNotes}>Update Notes</button>
      {message && <p>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    marginBottom: "10px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default DoctorProfile;
