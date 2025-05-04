import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const Dashboard = () => {
  const [upcomingDoctors, setUpcomingDoctors] = useState([]);
  const [upcomingRefills, setUpcomingRefills] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        const doctorRes = await axios.get("/doctors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const medRes = await axios.get("/medications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const today = dayjs();

        console.log("🩺 Doctors from API:", doctorRes.data.active_doctors);
        console.log("💊 Medications from API:", medRes.data.current_medications);

        // Debug refill dates
        medRes.data.current_medications.forEach((m) => {
          console.log(`Refill: ${m.name} → ${m.refill_date} → valid: ${dayjs(m.refill_date).isValid()}`);
        });

        // Debug next_schedule dates
        doctorRes.data.active_doctors.forEach((doc) => {
          console.log(`Doctor: ${doc.name} → ${doc.next_schedule} → valid: ${dayjs(doc.next_schedule).isValid()}`);
        });

        const filteredDoctors = doctorRes.data.active_doctors.filter((doc) => {
          const apptDate = dayjs(doc.next_schedule);
          return doc.next_schedule && apptDate.isValid() && apptDate.isAfter(today);
        });

        const filteredMeds = medRes.data.current_medications.filter((med) => {
          const refillDate = dayjs(med.refill_date);
          return med.refill_date && refillDate.isValid() && refillDate.isAfter(today);
        });

        setUpcomingDoctors(filteredDoctors);
        setUpcomingRefills(filteredMeds);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to Your Health Dashboard</h1>
      <p style={styles.subtitle}>Get a quick snapshot of your upcoming health tasks.</p>

      <div style={styles.section}>
        <h2>📅 Upcoming Doctor Appointments</h2>
        {upcomingDoctors.length === 0 ? (
          <p>No upcoming appointments.</p>
        ) : (
          <ul>
            {upcomingDoctors.map((doc) => (
              <li key={doc.id}>
                <strong>{doc.name}</strong> ({doc.specialty}) —{" "}
                {dayjs(doc.next_schedule).format("MMM D, YYYY")}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={styles.section}>
        <h2>💊 Upcoming Medication Refills</h2>
        {upcomingRefills.length === 0 ? (
          <p>No upcoming refills.</p>
        ) : (
          <ul>
            {upcomingRefills.map((med) => (
              <li key={med.id}>
                <strong>{med.name}</strong> — Refill by{" "}
                {dayjs(med.refill_date).format("MMM D, YYYY")}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1.2rem",
    marginBottom: "30px",
    color: "#555",
  },
  section: {
    marginBottom: "40px",
  },
};

export default Dashboard;
