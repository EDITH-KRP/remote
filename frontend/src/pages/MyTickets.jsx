import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { 
  X, Clock, MessageSquare, Star, ChevronRight, TicketIcon, 
  Paperclip, Send, Search, Filter, Plus, Calendar, AlertCircle, 
  ArrowLeftRight, FileText, User, ChevronDown, CheckCircle2
} from "lucide-react";
import io from "socket.io-client";
import { Link } from "react-router-dom";

const statusBadge = {
  Open:          "badge badge-blue",
  Assigned:      "badge badge-yellow",
  "In Progress": "badge badge-purple",
  Resolved:      "badge badge-green",
  Closed:        "badge badge-gray",
};

const priorityBadge = {
  Low: "badge badge-green", Medium: "badge badge-yellow",
  High: "badge badge-red",  Critical: "badge badge-red",
};

const statusAccent = {
  Open:          "#3b82f6",
  Assigned:      "#f59e0b",
  "In Progress": "#8b5cf6",
  Resolved:      "#10b981",
  Closed:        "rgba(107,114,128,0.5)",
};

const StarRating = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map(n => (
      <motion.button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        whileHover={{ scale: 1.25 }}
        whileTap={{ scale: 0.9 }}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: "1.5rem", lineHeight: 1, padding: "2px",
          filter: n <= value ? "drop-shadow(0 0 5px rgba(251,191,36,0.7))" : "grayscale(1)",
          opacity: n <= value ? 1 : 0.25,
          transition: "filter 0.15s, opacity 0.15s",
        }}
      >⭐</motion.button>
    ))}
  </div>
);

export default function MyTickets() {
  const [tickets,       setTickets]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);
  const [feedback,      setFeedback]      = useState({ rating: 5, comments: "" });
  const [feedbackSent,  setFeedbackSent]  = useState(false);
  const [comments,      setComments]      = useState([]);
  const [newComment,    setNewComment]    = useState("");
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("All");

  const loadTickets = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await api.get("/tickets");
      setTickets(r.data);
    } catch (err) {}
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    loadTickets();
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "http://localhost:5000");
    const socket = io(socketUrl);
    socket.on("tickets:update", () => {
      loadTickets(true);
      if (selected) fetchDetail(selected.id, true);
    });
    return () => socket.disconnect();
  }, [selected]);

  const fetchDetail = async (id, silent = false) => {
    const [tRes, cRes] = await Promise.all([
      api.get(`/tickets/${id}`),
      api.get(`/tickets/${id}/comments`)
    ]);
    setSelected(tRes.data);
    setComments(cRes.data);
    setFeedbackSent(!!tRes.data.feedback);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const res = await api.post(`/tickets/${selected.id}/comments`, { body: newComment });
    setComments([...comments, res.data]);
    setNewComment("");
  };

  const submitFeedback = async () => {
    await api.post(`/tickets/${selected.id}/feedback`, feedback);
    setFeedbackSent(true);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "55vh" }}>
      <div className="spinner" style={{ width: "40px", height: "40px", borderWidth: "3px" }} />
    </div>
  );

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.ticket_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto", paddingBottom: "4rem" }}>

      {/* ServiceNow Style Top List Breadcrumb */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ITIL Navigator &gt; Incidents
          </span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-1)", marginTop: "4px" }}>
            Incidents list
          </h1>
        </div>
        
        {/* Dynamic filter query indicator */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.72rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: "4px", color: "var(--text-2)" }}>
          <span style={{ color: "var(--text-3)" }}>Query Filter:</span>
          <strong>All &gt; Caller = Me {filterStatus !== "All" && `> State = ${filterStatus}`}</strong>
        </div>
      </div>

      {/* ServiceNow List Controls Header Card */}
      <div className="sn-table-list" style={{ marginBottom: "1.5rem" }}>
        
        <div className="sn-list-header" style={{ flexWrap: "wrap", gap: "1rem" }}>
          
          {/* Search bar inside header */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flex: 1, minWidth: "260px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                className="input"
                placeholder="Search incident number, caller, or subject..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ fontSize: "0.78rem", padding: "0.45rem 1rem 0.45rem 2.25rem", background: "rgba(0,0,0,0.18)" }}
              />
              <Search size={13} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            </div>

            <div style={{ position: "relative" }}>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="input"
                style={{ fontSize: "0.78rem", padding: "0.45rem 2.25rem 0.45rem 1.75rem", background: "rgba(0,0,0,0.18)", width: "140px" }}
              >
                <option value="All">All States</option>
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <Filter size={11} style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            </div>
          </div>

          {/* ServiceNow New Incident Button */}
          <Link to="/raise-ticket" className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Plus size={14} /> New Incident
          </Link>
        </div>

        {/* High-density Incidents Table List */}
        {filteredTickets.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📁</div>
            <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>No matching records found.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.01)" }}>
                  <th style={{ paddingLeft: "1.5rem", width: "130px" }}>Number</th>
                  <th style={{ width: "130px" }}>Opened</th>
                  <th>Short Description</th>
                  <th style={{ width: "130px" }}>State</th>
                  <th style={{ width: "110px" }}>Priority</th>
                  <th style={{ width: "150px" }}>Category</th>
                  <th style={{ paddingRight: "1.5rem", width: "140px" }}>Assigned to</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(t => (
                  <tr key={t.id} onClick={() => fetchDetail(t.id)} style={{ cursor: "pointer" }}>
                    <td style={{ paddingLeft: "1.5rem" }}>
                      <span className="ticket-chip" style={{ background: "rgba(3,105,161,0.06)", fontSize: "0.7rem" }}>
                        {t.ticket_number}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-2)", fontSize: "0.78rem" }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text-1)", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.subject}
                    </td>
                    <td>
                      <span className={statusBadge[t.status] || "badge badge-gray"}>{t.status}</span>
                    </td>
                    <td>
                      <span className={priorityBadge[t.priority] || "badge badge-gray"}>{t.priority}</span>
                    </td>
                    <td style={{ color: "var(--text-2)", fontSize: "0.81rem" }}>
                      {t.category_name || "N/A"}
                    </td>
                    <td style={{ paddingRight: "1.5rem", color: "var(--text-2)", fontSize: "0.81rem" }}>
                      {t.assigned_staff_name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Modal (ServiceNow aligned detail card) ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{   opacity: 0, scale: 0.95, y: 20  }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={e => e.stopPropagation()}
              style={{ position: "relative", width: "100%", maxWidth: "580px" }}
            >
              <div style={{
                maxHeight: "88vh", overflowY: "auto",
                background: "var(--bg-2)", border: "1px solid var(--border-2)",
                borderRadius: "var(--r-md)", padding: "1.875rem",
                boxShadow: "var(--shadow-lg)", position: "relative"
              }}>

                {/* Modal close */}
                <button onClick={() => setSelected(null)} className="btn-icon" style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }}>
                  <X size={16} />
                </button>

                {/* Header breadcrumb */}
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Self-Service &gt; Incidents &gt; {selected.ticket_number}
                  </span>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-1)", marginTop: "4px" }}>
                    {selected.subject}
                  </h2>
                </div>

                {/* Status bar */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                  <span className={statusBadge[selected.status] || "badge badge-gray"}>{selected.status}</span>
                  <span className={priorityBadge[selected.priority] || "badge badge-gray"}>{selected.priority} Priority</span>
                </div>

                {/* 2-column ServiceNow Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem", padding: "0.75rem", background: "rgba(0,0,0,0.15)", border: "1px solid var(--border)", borderRadius: "4px", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Category</span>
                    <span style={{ fontSize: "0.83rem", color: "var(--text-1)", fontWeight: 600 }}>{selected.category?.category_name || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Opened At</span>
                    <span style={{ fontSize: "0.83rem", color: "var(--text-1)", fontWeight: 600 }}>{new Date(selected.createdAt).toLocaleDateString()} {new Date(selected.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", marginTop: "4px" }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Impact / Urgency</span>
                    <span style={{ fontSize: "0.83rem", color: "var(--text-1)", fontWeight: 600 }}>{selected.impact} / {selected.urgency}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", marginTop: "4px" }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Assigned Technician</span>
                    <span style={{ fontSize: "0.83rem", color: "var(--text-1)", fontWeight: 600 }}>{selected.assigned_staff?.full_name || "Unassigned"}</span>
                  </div>
                </div>

                {/* Description */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", padding: "1rem", marginBottom: "1.25rem" }}>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Description</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-2)", whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0 }}>
                    {selected.description}
                  </p>
                </div>

                {selected.attachment_url && (
                  <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Paperclip size={13} style={{ color: "var(--text-3)" }} />
                    <a href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000"}${selected.attachment_url}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.85rem", color: "var(--p3)", textDecoration: "none", fontWeight: 600 }}>
                      View Attachment
                    </a>
                  </div>
                )}

                {/* Activity Feed / Conversation */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.625rem" }}>
                    <MessageSquare size={13} style={{ color: "var(--text-3)" }} />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Activity Stream ({comments.length})
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem", maxHeight: "180px", overflowY: "auto", paddingRight: "4px" }}>
                    {comments.map(c => (
                      <div key={c.id} style={{
                        background: c.author_id === selected.user_id ? "rgba(99,102,241,0.06)" : "rgba(16,185,129,0.06)",
                        border: `1px solid ${c.author_id === selected.user_id ? "rgba(99,102,241,0.18)" : "rgba(16,185,129,0.18)"}`,
                        borderRadius: "var(--r-md)", padding: "0.75rem",
                        maxWidth: "85%",
                        alignSelf: c.author_id === selected.user_id ? "flex-end" : "flex-start"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.25rem" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-1)" }}>{c.author?.full_name}</span>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p style={{ fontSize: "0.81rem", color: "var(--text-2)", whiteSpace: "pre-wrap", margin: 0 }}>{c.body}</p>
                      </div>
                    ))}
                  </div>

                  {!["Resolved", "Closed"].includes(selected.status) && (
                    <form onSubmit={handleAddComment} style={{ display: "flex", gap: "0.5rem" }}>
                      <input 
                        type="text" 
                        className="input" 
                        placeholder="Add a reply..." 
                        value={newComment} 
                        onChange={e => setNewComment(e.target.value)} 
                        style={{ fontSize: "0.8rem", padding: "0.45rem 0.75rem" }}
                      />
                      <button type="submit" className="btn btn-primary btn-sm" disabled={!newComment.trim()}>
                        <Send size={14} />
                      </button>
                    </form>
                  )}
                </div>

                {/* Audit Logs */}
                {selected.logs?.length > 0 && (
                  <div style={{ marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.5rem" }}>
                      <Clock size={12} style={{ color: "var(--text-3)" }} />
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase" }}>Audit Logs</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {selected.logs.slice(0, 3).map((log, idx) => (
                        <div key={idx} style={{ fontSize: "0.74rem", color: "var(--text-3)" }}>
                          • {log.action} ({new Date(log.createdAt).toLocaleDateString()})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {selected.status === "Resolved" && !feedbackSent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: "rgba(251,191,36,0.05)",
                      border: "1px solid rgba(251,191,36,0.18)",
                      borderRadius: "var(--r-md)",
                      padding: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "0.625rem" }}>
                      <Star size={14} style={{ color: "#fbbf24" }} />
                      <span style={{ fontWeight: 700, color: "var(--text-1)", fontSize: "0.875rem" }}>
                        How was your experience?
                      </span>
                    </div>
                    <StarRating value={feedback.rating} onChange={r => setFeedback({ ...feedback, rating: r })} />
                    <textarea
                      rows={2}
                      placeholder="Additional comments (optional)"
                      value={feedback.comments}
                      onChange={e => setFeedback({ ...feedback, comments: e.target.value })}
                      className="input"
                      style={{ marginTop: "0.75rem", marginBottom: "0.75rem", resize: "none", fontSize: "0.8rem" }}
                    />
                    <button onClick={submitFeedback} className="btn btn-primary btn-sm" style={{ width: "100%" }}>
                      Submit Feedback
                    </button>
                  </motion.div>
                )}

                {feedbackSent && selected.status === "Resolved" && (
                  <div className="alert alert-success" style={{ padding: "0.6rem 0.85rem", fontSize: "0.82rem" }}>
                    🎉 Feedback submitted — thank you!
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
