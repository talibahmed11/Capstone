import React, { useState, useEffect } from "react";
import axios from "axios";

const AddMedication = () => {
  const [formData, setFormData] = useState({ name: "", dosage: "", time: "", start_date: "", end_date: "", is_current: true });
  const [medications, setMedications] = useState({ current: [], past: [] });
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
    if (token) fetchMedications();
  }, [token, page, search, limit, sortBy, order]);

  const fetchMedications = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/medications?page=${page}&search=${search}&limit=${limit}&sort_by=${sortBy}&order=${order}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedications({
        current: response.data.current_medications || [],
        past: response.data.past_medications || [],
      });
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error("❌ Fetch error:", error.response?.data || error.message);
      setMessage("❌ Failed to fetch medications.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "is_current" && checked ? { end_date: "" } : {})
    });
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!token) return setMessage("❌ Please log in to add medication.");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (editingId) {
        await axios.put(`http://127.0.0.1:5000/medications/${editingId}`, formData, config);
        setMessage("✅ Medication updated.");
      } else {
        await axios.post("http://127.0.0.1:5000/medications", formData, config);
        setMessage("✅ Medication added.");
      }

      setFormData({ name: "", dosage: "", time: "", start_date: "", end_date: "", is_current: true });
      setEditingId(null);
      fetchMedications();
    } catch (error) {
      console.error("❌ Submit error:", error.response?.data || error.message);
      setMessage("❌ Error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (med) => {
    setFormData({
      name: med.name,
      dosage: med.dosage,
      time: med.time,
      start_date: med.start_date || "",
      end_date: med.end_date || "",
      is_current: med.is_current
    });
    setEditingId(med.id);
    setMessage("");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/medications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("🗑️ Medication deleted.");
      fetchMedications();
    } catch (error) {
      console.error("❌ Delete error:", error.response?.data || error.message);
      setMessage("❌ Failed to delete medication.");
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div style={styles.container}>
      <h2>Add or Update Medication</h2>

      <form onSubmit={handleAddOrUpdate} style={styles.form}>
        <input type="text" name="name" placeholder="Medication Name" value={formData.name} onChange={handleChange} style={styles.input} required />
        <input type="text" name="dosage" placeholder="Dosage (e.g., 20mg)" value={formData.dosage} onChange={handleChange} style={styles.input} />
        <input type="text" name="time" placeholder="Frequency (e.g., Once a day)" value={formData.time} onChange={handleChange} style={styles.input} />
        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} style={styles.input} />
        {!formData.is_current && (
          <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} style={styles.input} />
        )}
        <label>
          <input type="checkbox" name="is_current" checked={formData.is_current} onChange={handleChange} /> Currently Taking
        </label>
        <button type="submit" style={styles.button}>{editingId ? "Update" : "Add"}</button>
      </form>

      <div style={{ ...styles.form, flexDirection: "row", gap: "10px" }}>
        <input type="text" placeholder="Search by name..." value={search} onChange={handleSearchChange} style={styles.input} />
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={styles.input}>
          <option value={3}>3 per page</option>
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.input}>
          <option value="id">Sort by ID</option>
          <option value="name">Sort by Name</option>
          <option value="time">Sort by Time</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value)} style={styles.input}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      <div style={styles.pagination}>
        <button
          style={page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          style={page >= totalPages ? styles.pageBtnDisabled : styles.pageBtn}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>

      {message && <p>{message}</p>}

      <h3>Current Medications</h3>
      <ul style={styles.medList}>
        {medications.current.map((med) => (
          <li key={med.id} style={styles.medItem}>
            <strong>{med.name}</strong> — {med.dosage} at {med.time}
            <div>
              <button style={styles.editBtn} onClick={() => handleEdit(med)}>Edit</button>
              <button style={styles.delBtn} onClick={() => handleDelete(med.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <h3>Past Medications</h3>
      <ul style={styles.medList}>
        {medications.past.map((med) => (
          <li key={med.id} style={styles.medItem}>
            <strong>{med.name}</strong> — {med.dosage} at {med.time}
            <div>
              <button style={styles.editBtn} onClick={() => handleEdit(med)}>Edit</button>
              <button style={styles.delBtn} onClick={() => handleDelete(med.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  medList: {
    listStyle: "none",
    padding: 0,
  },
  medItem: {
    backgroundColor: "#f1f1f1",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editBtn: {
    marginRight: "10px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  delBtn: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "20px 0",
  },
  pageBtn: {
    padding: "8px 12px",
    backgroundColor: "#2980b9",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    opacity: 1,
  },
  pageBtnDisabled: {
    padding: "8px 12px",
    backgroundColor: "#ccc",
    color: "#666",
    border: "none",
    borderRadius: "5px",
    cursor: "not-allowed",
    opacity: 0.6,
  },
};

export default AddMedication;
