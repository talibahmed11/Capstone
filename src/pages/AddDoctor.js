import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddDoctor = () => {
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    first_seen: "",
    next_schedule: "", // unified field
    is_active: true,
  });

  const [doctors, setDoctors] = useState({ active: [], past: [] });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) fetchDoctors();
  }, [token, page, search, sortBy, order]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/doctors?page=${page}&search=${search}&limit=${limit}&sort_by=${sortBy}&order=${order}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date ? date.toISOString().split("T")[0] : "",
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
        first_seen: "",
        next_schedule: "",
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
      first_seen: doc.first_seen || "",
      next_schedule: doc.next_schedule || "",
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
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h2>Manage Doctors</h2>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="id">Sort by ID</option>
          <option value="name">Sort by Name</option>
          <option value="specialty">Sort by Specialty</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input name="name" placeholder="Doctor's Name" value={formData.name} onChange={handleChange} required />
        <input name="specialty" placeholder="Specialty" value={formData.specialty} onChange={handleChange} />

        <DatePicker
          selected={formData.first_seen ? new Date(formData.first_seen) : null}
          onChange={(date) => handleDateChange("first_seen", date)}
          placeholderText="First Seen"
          dateFormat="MM/dd/yyyy"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />

        <DatePicker
          selected={formData.next_schedule ? new Date(formData.next_schedule) : null}
          onChange={(date) => handleDateChange("next_schedule", date)}
          placeholderText="Next Scheduled Visit"
          dateFormat="MM/dd/yyyy"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />

        <label>
          <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Active Doctor
        </label>
        <button type="submit">{editingId ? "Update" : "Add"}</button>
      </form>

      <p>{message}</p>
      <hr />
      <h3>Active Doctors</h3>
      <ul>
        {doctors.active.map((d) => (
          <li key={d.id}>
            <strong>{d.name}</strong> — {d.specialty} — <Link to={`/doctors/${d.id}`}>View Profile</Link>{" "}
            <button onClick={() => handleEdit(d)}>Edit</button>{" "}
            <button onClick={() => handleDelete(d.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Past Doctors</h3>
      <ul>
        {doctors.past.map((d) => (
          <li key={d.id}>
            <strong>{d.name}</strong> — {d.specialty} — <Link to={`/doctors/${d.id}`}>View Profile</Link>{" "}
            <button onClick={() => handleEdit(d)}>Edit</button>{" "}
            <button onClick={() => handleDelete(d.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
          ⬅ Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages}>
          Next ➡
        </button>
      </div>
    </div>
  );
};

export default AddDoctor;
