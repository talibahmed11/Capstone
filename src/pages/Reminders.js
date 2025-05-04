import React, { useEffect, useState } from "react";
import axios from "axios";

const Reminders = () => {
  const [doctors, setDoctors] = useState([]);
  const [medications, setMedications] = useState([]);
  const [reminderType, setReminderType] = useState("doctor");
  const [selectedId, setSelectedId] = useState("");
  const [timeBefore, setTimeBefore] = useState("24h");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchDoctors();
      fetchMedications();
    }
  }, [token]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data.active_doctors || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const fetchMedications = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/medications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedications(res.data.current_medications || []);
    } catch (err) {
      console.error("Error fetching medications:", err);
    }
  };

  const handleReminderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId || !timeBefore) return setMessage("Please select all fields.");

    try {
      const res = await axios.post("http://127.0.0.1:5000/set_reminder", {
        type: reminderType,
        id: selectedId,
        time_before: timeBefore,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMessage(res.data.message || "✅ Reminder set.");
    } catch (err) {
      console.error("Error setting reminder:", err);
      setMessage("❌ Failed to set reminder.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>Set a Reminder</h2>

      <form onSubmit={handleReminderSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label>
          Reminder For:
          <select value={reminderType} onChange={(e) => { setReminderType(e.target.value); setSelectedId(""); }}>
            <option value="doctor">Doctor Appointment</option>
            <option value="medication">Medication Refill</option>
          </select>
        </label>

        <label>
          Select {reminderType === "doctor" ? "Doctor" : "Medication"}:
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
            <option value="">-- Select --</option>
            {(reminderType === "doctor" ? doctors : medications).map((item) => (
              <option key={item.id} value={item.id}>
                {reminderType === "doctor" ? item.name : item.name + " - " + item.time}
              </option>
            ))}
          </select>
        </label>

        <label>
          Reminder Time:
          <select value={timeBefore} onChange={(e) => setTimeBefore(e.target.value)}>
            <option value="24h">24 Hours Before</option>
            <option value="7d">7 Days Before</option>
          </select>
        </label>

        <button type="submit" style={{ padding: "10px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "5px" }}>
          Set Reminder
        </button>
      </form>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
};

export default Reminders;
