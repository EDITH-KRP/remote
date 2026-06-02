import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { motion } from "framer-motion";
import { User, Phone, Lock, Save, Briefcase, Mail, Home, Shield, Bookmark } from "lucide-react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    employee_id: user?.employee_id || "",
    alternate_email: user?.alternate_email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setTicketsLoading(true);
      const endpoint = (user.role === "support" || user.role === "admin")
        ? "/tickets/assigned"
        : "/tickets";
      api.get(endpoint)
        .then(res => setTickets(res.data))
        .catch(err => console.error(err))
        .finally(() => setTicketsLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        full_name: user.full_name || "",
        employee_id: user.employee_id || "",
        alternate_email: user.alternate_email || "",
        phone: user.phone || ""
      }));
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.message) {
      toast.error(location.state.message, { id: "profile-redirect" });
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/auth/profile", form);
      toast.success("Profile updated successfully");
      setForm({ ...form, currentPassword: "", newPassword: "" });
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
    setLoading(false);
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: "860px", margin: "0 auto", paddingBottom: "4rem" }}
    >
      
      {/* ServiceNow Profile Navigation Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Self-Service &gt; My Profile &gt; {user?.employee_id || "SYS-USER"}
        </span>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-1)", marginTop: "4px" }}>
          User Profile
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }} className="lg:grid-cols-dash">
        
        {/* Left Side: ServiceNow Editable Profile Form (gets 2fr column) */}
        <div style={{ background: "rgba(10,12,22,0.82)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "var(--r-lg)", padding: "2rem", backdropFilter: "blur(20px)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* ServiceNow two-column field alignment */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="input-label"><User size={11} style={{ display: "inline", marginRight: "4px" }} /> Full Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={form.full_name}
                  onChange={e => setForm({...form, full_name: e.target.value})}
                  required
                  style={{ fontSize: "0.85rem", padding: "0.55rem 0.75rem" }}
                />
              </div>

              <div>
                <label className="input-label"><Briefcase size={11} style={{ display: "inline", marginRight: "4px" }} /> Employee ID <span style={{ color: "#f87171" }}>*</span></label>
                <input 
                  type="text" 
                  className="input" 
                  value={form.employee_id}
                  onChange={e => setForm({...form, employee_id: e.target.value})}
                  required
                  style={{ fontSize: "0.85rem", padding: "0.55rem 0.75rem" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="input-label"><Mail size={11} style={{ display: "inline", marginRight: "4px" }} /> Alternate Email <span style={{ color: "#f87171" }}>*</span></label>
                <input 
                  type="email" 
                  className="input" 
                  value={form.alternate_email}
                  onChange={e => setForm({...form, alternate_email: e.target.value})}
                  required
                  style={{ fontSize: "0.85rem", padding: "0.55rem 0.75rem" }}
                />
              </div>

              <div>
                <label className="input-label"><Phone size={11} style={{ display: "inline", marginRight: "4px" }} /> Phone Number <span style={{ color: "#f87171" }}>*</span></label>
                <input 
                  type="text" 
                  className="input" 
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  required
                  style={{ fontSize: "0.85rem", padding: "0.55rem 0.75rem" }}
                />
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", margin: "0.5rem 0" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "0.825rem", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Security Settings</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="input-label"><Lock size={11} style={{ display: "inline", marginRight: "4px" }} /> Current Password</label>
                  <input 
                    type="password" 
                    className="input" 
                    placeholder="Enter current password"
                    value={form.currentPassword}
                    onChange={e => setForm({...form, currentPassword: e.target.value})}
                    style={{ fontSize: "0.85rem", padding: "0.55rem 0.75rem" }}
                  />
                </div>
                <div>
                  <label className="input-label"><Lock size={11} style={{ display: "inline", marginRight: "4px" }} /> New Password</label>
                  <input 
                    type="password" 
                    className="input" 
                    placeholder="Leave blank to keep same"
                    value={form.newPassword}
                    onChange={e => setForm({...form, newPassword: e.target.value})}
                    style={{ fontSize: "0.85rem", padding: "0.55rem 0.75rem" }}
                  />
                </div>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ marginTop: "0.5rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              {loading ? "Saving Changes..." : <><Save size={15} /> Save Record</>}
            </motion.button>
          </form>
        </div>

        {/* Right Side: ServiceNow User Badge & Info Card (gets 1fr column) */}
        <div style={{ background: "rgba(10,12,22,0.82)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "var(--r-lg)", padding: "2rem 1.5rem", textAlign: "center", backdropFilter: "blur(20px)", height: "fit-content" }}>
          
          <div style={{
            width: "74px", height: "74px", borderRadius: "50%",
            background: "var(--grad-main)", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "1.5rem", fontWeight: 800,
            boxShadow: "0 4px 20px rgba(3,105,161,0.5)",
            margin: "0 auto 1rem",
            border: "3px solid rgba(3,105,161,0.3)"
          }}>
            {initials}
          </div>

          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", margin: "0 0 4px" }}>{user?.full_name}</h3>
          <span style={{ fontSize: "0.72rem", color: "var(--p3)", fontWeight: 700, textTransform: "uppercase", background: "rgba(3,105,161,0.12)", border: "1px solid var(--border-2)", borderRadius: "99px", padding: "2px 10px" }}>
            {user?.role} Account
          </span>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "1.5rem", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-2)" }}>
              <Shield size={12} style={{ color: "var(--text-3)" }} />
              <span>Role: <strong style={{ color: "var(--text-1)" }}>{user?.role}</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-2)" }}>
              <Bookmark size={12} style={{ color: "var(--text-3)" }} />
              <span>Department: <strong style={{ color: "var(--text-1)" }}>{user?.department || "Others"}</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-2)" }}>
              <Mail size={12} style={{ color: "var(--text-3)" }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Email: <strong style={{ color: "var(--text-1)" }}>{user?.email}</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* ── My Assigned Tasks / Open Incidents Section ── */}
      <div style={{ marginTop: "2rem" }}>
        <div style={{ background: "rgba(10,12,22,0.82)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "var(--r-lg)", padding: "2rem", backdropFilter: "blur(20px)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <Bookmark size={16} style={{ color: "var(--p3)" }} />
            {user?.role === "support" || user?.role === "admin" ? "My Assigned Incidents & Tasks" : "My Open Requests & Incidents"}
            <span style={{ fontSize: "0.75rem", background: "rgba(99,102,241,0.15)", color: "var(--p3)", padding: "2px 8px", borderRadius: "99px", fontWeight: 700 }}>{tickets.length}</span>
          </h3>

          {ticketsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "2rem" }}>
              <div className="spinner" style={{ width: "28px", height: "28px", borderWidth: "2.5px" }} />
              <p style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>Loading incidents...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: "3rem 1.5rem", textAlign: "center", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "var(--r-md)" }}>
              <p style={{ color: "var(--text-3)", fontSize: "0.85rem", margin: 0 }}>No active tickets or incidents found.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: "1.25rem" }}>Number</th>
                    <th>Subject</th>
                    <th>{user?.role === "support" || user?.role === "admin" ? "Caller" : "Assigned To"}</th>
                    <th>Priority</th>
                    <th style={{ paddingRight: "1.25rem" }}>State</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => {
                    const statusColors = {
                      Open:          "badge-blue",
                      Assigned:      "badge-yellow",
                      "In Progress": "badge-blue",
                      Resolved:      "badge-green",
                      Closed:        "badge-gray",
                      New:           "badge-yellow"
                    };
                    const priorityColors = {
                      Low: "badge-green",
                      Medium: "badge-yellow",
                      High: "badge-red",
                      Critical: "badge-red"
                    };
                    return (
                      <tr key={t.id}>
                        <td style={{ paddingLeft: "1.25rem" }}><span className="ticket-chip">{t.ticket_number}</span></td>
                        <td style={{ color: "var(--text-1)", fontWeight: 600, fontSize: "0.85rem" }}>{t.subject}</td>
                        <td style={{ color: "var(--text-2)", fontSize: "0.825rem" }}>
                          {user?.role === "support" || user?.role === "admin" ? t.author_name || "Guest" : t.assigned_staff_name || "—"}
                        </td>
                        <td>
                          <span className={`badge ${priorityColors[t.priority] || 'badge-gray'}`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                            {t.priority}
                          </span>
                        </td>
                        <td style={{ paddingRight: "1.25rem" }}>
                          <span className={`badge ${statusColors[t.status || t.state] || 'badge-gray'}`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                            {t.status || t.state}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
}
