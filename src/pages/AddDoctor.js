import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AddDoctor = () => {
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    next_appointment: "",
    first_seen: "",
    is_active: true,
  });
  const [doctors, setDoctors] = useState({ active: [], past: [] });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) fetchDoctors();
  }, [token, page, search, limit, sortBy, order]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/doctors?page=${page}&search=${search}&limit=${limit}&sort_by=${sortBy}&order=${order}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors({ active: res.data.active_doctors, past: res.data.past_doctors });
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch doctors.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "is_active" && checked ? { next_appointment: "" } : {}),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setMessage("Please login.");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:5000/doctors/${editingId}`, formData, config);
        setMessage("✅ Doctor updated");
      } else {
        await axios.post("http://127.0.0.1:5000/doctors", formData, config);
        setMessage("✅ Doctor added");
      }

      setFormData({
        name: "",
        specialty: "",
        next_appointment: "",
        first_seen: "",
        is_active: true,
      });
      setEditingId(null);
      fetchDoctors();
    } catch (err) {
      console.error(err);
      setMessage("❌ Submission failed");
    }
  };

  const handleEdit = (doc) => {
    setFormData({
      name: doc.name,
      specialty: doc.specialty,
      next_appointment: doc.next_appointment || "",
      first_seen: doc.first_seen || "",
      is_active: doc.is_active,
    });
    setEditingId(doc.id);
    setMessage("");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("🗑️ Doctor deleted.");
      fetchDoctors();
    } catch {
      setMessage("❌ Delete failed");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Manage Doctors</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input name="name" placeholder="Doctor's Name" value={formData.name} onChange={handleChange} required />
        <input name="specialty" placeholder="Specialty" value={formData.specialty} onChange={handleChange} />
        <input type="date" name="first_seen" value={formData.first_seen} onChange={handleChange} />
        {!formData.is_active && (
          <input type="date" name="next_appointment" value={formData.next_appointment} onChange={handleChange} />
        )}
        <label>
          <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Active Doctor
        </label>
        <button type="submit">{editingId ? "Update" : "Add"}</button>
      </form>

      <hr />
      <h3>Active Doctors</h3>
      <ul>
        {doctors.active.map((d) =>
          d.id ? (
            <li key={d.id}>
              <strong>{d.name}</strong> — {d.specialty} —{" "}
              <Link to={`/doctors/${d.id}`}>View Profile</Link>
              <button onClick={() => handleEdit(d)}>Edit</button>
              <button onClick={() => handleDelete(d.id)}>Delete</button>
            </li>
          ) : null
        )}
      </ul>

      <h3>Past Doctors</h3>
      <ul>
        {doctors.past.map((d) =>
          d.id ? (
            <li key={d.id}>
              <strong>{d.name}</strong> — {d.specialty} —{" "}
              <Link to={`/doctors/${d.id}`}>View Profile</Link>
              <button onClick={() => handleEdit(d)}>Edit</button>
              <button onClick={() => handleDelete(d.id)}>Delete</button>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};

export default AddDoctor;
