import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { 
  X, Clock, MessageSquare, Star, ChevronRight, TicketIcon, 
  Paperclip, Send, Search, Filter, Plus, Calendar, AlertCircle, 
  ArrowLeftRight, FileText, User, ChevronDown, CheckCircle2,
  CornerDownRight, ShieldAlert, Lock, RotateCcw
} from "lucide-react";
import io from "socket.io-client";
import { Link } from "react-router-dom";

const statusBadge = {
  Open:          "badge badge-blue",
  Assigned:      "badge badge-yellow",
  "In Progress": "badge badge-blue",
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
  "In Progress": "#2563EB",
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
  
  // ServiceNow Tab inside the detailed drawer modal
  const [drawerTab,     setDrawerTab]     = useState("notes");

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
    setDrawerTab("notes");
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

  // ServiceNow Styling
  const serviceNowFieldStyle = {
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    padding: "0.55rem 0",
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  };
  const serviceNowLabelStyle = {
    fontSize: "0.68rem",
    color: "var(--text-3)",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em"
  };
  const serviceNowValueStyle = {
    fontSize: "0.85rem",
    color: "var(--text-1)",
    fontWeight: 600
  };

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto", paddingBottom: "4rem" }}>

      {/* ServiceNow Breadcrumbs Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ITIL Navigator &gt; Incidents
          </span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-1)", marginTop: "4px" }}>
            Incidents list
          </h1>
        </div>
        
        <div style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.72rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: "4px", color: "var(--text-2)" }}>
          <span style={{ color: "var(--text-3)" }}>Query Filter:</span>
          <strong>All &gt; Caller = Me {filterStatus !== "All" && `> State = ${filterStatus}`}</strong>
        </div>
      </div>

      {/* List controls */}
      <div className="sn-table-list" style={{ marginBottom: "1.5rem" }}>
        
        <div className="sn-list-header" style={{ flexWrap: "wrap", gap: "1rem" }}>
          
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

          <Link to="/raise-ticket" className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Plus size={14} /> New Incident
          </Link>
        </div>

        {/* List table */}
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
                      <span className="ticket-chip" style={{ background: "rgba(53,122,112,0.06)", fontSize: "0.7rem" }}>
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

      {/* ── Detail Modal (ServiceNow ServiceNow-Aligned Tabbed Drawer) ── */}
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
                borderRadius: "var(--r-md)", padding: "1.75rem",
                boxShadow: "var(--shadow-lg)", position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem"
              }}>

                {/* Modal close */}
                <button onClick={() => setSelected(null)} className="btn-icon" style={{ position: "absolute", top: "1.5rem", right: "1.5rem", zIndex: 10 }}>
                  <X size={16} />
                </button>

                {/* Header breadcrumb */}
                <div style={{ marginBottom: "-0.5rem" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Self-Service &gt; Incidents &gt; {selected.ticket_number}
                  </span>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-1)", marginTop: "4px" }}>
                    {selected.subject}
                  </h2>
                </div>

                {/* Status bar */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                  <span className={statusBadge[selected.status] || "badge badge-gray"}>{selected.status}</span>
                  <span className={priorityBadge[selected.priority] || "badge badge-gray"}>{selected.priority} Priority</span>
                  {selected.ticket_type && <span className="badge badge-indigo">{selected.ticket_type}</span>}
                </div>

                {/* 2-column ServiceNow Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1.25rem", padding: "0.85rem 1.1rem", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(53,122,112,0.1)", borderRadius: "var(--r-sm)" }}>
                  
                  <div style={serviceNowFieldStyle}>
                    <span style={serviceNowLabelStyle}>Caller (Reporter)</span>
                    <span style={serviceNowValueStyle}>{selected.author?.full_name || selected.author_name || "Guest"}</span>
                  </div>
                  <div style={serviceNowFieldStyle}>
                    <span style={serviceNowLabelStyle}>Opened At</span>
                    <span style={serviceNowValueStyle}>{new Date(selected.createdAt).toLocaleDateString()} {new Date(selected.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div style={serviceNowFieldStyle}>
                    <span style={serviceNowLabelStyle}>Category</span>
                    <span style={serviceNowValueStyle}>{selected.category?.category_name || "N/A"}</span>
                  </div>
                  <div style={serviceNowFieldStyle}>
                    <span style={serviceNowLabelStyle}>State (Status)</span>
                    <span style={serviceNowValueStyle}>{selected.status}</span>
                  </div>

                  <div style={serviceNowFieldStyle}>
                    <span style={serviceNowLabelStyle}>Impact</span>
                    <span style={serviceNowValueStyle}>{selected.impact || "Low"}</span>
                  </div>
                  <div style={serviceNowFieldStyle}>
                    <span style={serviceNowLabelStyle}>Urgency</span>
                    <span style={serviceNowValueStyle}>{selected.urgency || "Low"}</span>
                  </div>

                </div>

                {/* ServiceNow Multi-Tabs Navigation Bar */}
                <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", marginTop: "0.25rem", gap: "10px" }}>
                  {[
                    { id: "notes", label: "Activity & Notes" },
                    { id: "related", label: "Related Records" },
                    { id: "resolution", label: "Resolution Info" }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setDrawerTab(t.id)}
                      style={{
                        padding: "0.55rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, border: "none",
                        background: "none", cursor: "pointer", fontFamily: "inherit",
                        color: drawerTab === t.id ? "var(--p3)" : "var(--text-3)",
                        borderBottom: `2.5px solid ${drawerTab === t.id ? "var(--p3)" : "transparent"}`,
                        marginBottom: "-1.5px"
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab Viewports */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  
                  {/* TAB 1: NOTES & COMMENT STREAMS */}
                  {drawerTab === "notes" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      
                      {/* Incident descriptions */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "6px", padding: "0.75rem" }}>
                          <p style={serviceNowLabelStyle}>Short Description</p>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-1)", fontWeight: 600, marginTop: "4px" }}>{selected.subject}</p>
                        </div>

                        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "6px", padding: "0.75rem" }}>
                          <p style={serviceNowLabelStyle}>Description</p>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.5, whiteSpace: "pre-wrap", marginTop: "4px" }}>{selected.description}</p>
                        </div>
                        
                        {selected.attachment_url && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "2px 4px" }}>
                            <CornerDownRight size={12} style={{ color: "var(--p3)" }} />
                            <a href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000"}${selected.attachment_url}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.83rem", color: "var(--p3)", textDecoration: "none", fontWeight: 600 }}>
                              View Attached Document
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Incident Activity Stream */}
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <MessageSquare size={13} style={{ color: "var(--text-3)" }} />
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Activity Stream ({comments.length})
                          </span>
                        </div>

                        {/* Comment list with signature ServiceNow Work Notes orange color & customer comments blue color */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "170px", overflowY: "auto", paddingRight: "4px" }}>
                          {comments.map(c => (
                            <div 
                              key={c.id} 
                              style={{ 
                                background: c.is_internal ? "rgba(245,158,11,0.06)" : "rgba(16,185,129,0.06)",
                                border: `1px solid ${c.is_internal ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)"}`,
                                borderRadius: "var(--r-sm)", padding: "0.75rem",
                                maxWidth: "85%",
                                alignSelf: c.author_id === selected.user_id ? "flex-end" : "flex-start"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-1)" }}>
                                  {c.author?.full_name} 
                                  {c.is_internal && <span style={{ marginLeft: "6px", fontSize: "0.625rem", color: "#fb923c", background: "rgba(245,158,11,0.15)", padding: "1px 5px", borderRadius: "3px" }}><Lock size={9} style={{ display:"inline", marginRight:"2px" }}/> Work Note</span>}
                                </span>
                                <span style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>{new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p style={{ fontSize: "0.81rem", color: "var(--text-2)", whiteSpace: "pre-wrap", lineHeight: 1.4, margin: 0 }}>{c.body}</p>
                            </div>
                          ))}
                          {comments.length === 0 && <p style={{ fontSize: "0.8rem", color: "var(--text-3)", fontStyle: "italic", padding: "0.5rem" }}>No comments in the feed.</p>}
                        </div>

                        {/* Reply Form */}
                        {!["Resolved", "Closed"].includes(selected.status) && (
                          <form onSubmit={handleAddComment} style={{ display: "flex", gap: "0.5rem", marginTop: "4px" }}>
                            <input
                              type="text"
                              className="input"
                              placeholder="Add an update to this incident..."
                              value={newComment}
                              onChange={e => setNewComment(e.target.value)}
                              style={{ fontSize: "0.8125rem", padding: "0.45rem 0.75rem" }}
                            />
                            <button type="submit" className="btn btn-primary btn-sm" disabled={!newComment.trim()}>
                              Post Update
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: RELATED RECORDS & CMDB LINKS */}
                  {drawerTab === "related" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1rem" }}>
                        <h4 style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--p3)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Configuration Item CMDB Mapping</h4>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={serviceNowFieldStyle}>
                            <span style={serviceNowLabelStyle}>Affected CI Asset</span>
                            <span style={serviceNowValueStyle}>
                              {selected.category_name === "Database" ? "Supabase-PostgresDB-Cluster" : 
                               selected.category_name === "Networking" ? "ELB-LoadBalancer-Node" : "Corporate-ActiveDirectory-Server"}
                            </span>
                          </div>
                          <div style={serviceNowFieldStyle}>
                            <span style={serviceNowLabelStyle}>Asset Class</span>
                            <span style={serviceNowValueStyle}>Software / Database CI Node</span>
                          </div>
                          <div style={serviceNowFieldStyle}>
                            <span style={serviceNowLabelStyle}>Operational SLA Metric</span>
                            <span style={serviceNowValueStyle}>SLA-Severity-2-Response-Time</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1rem" }}>
                        <h4 style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--p3)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Incident SLA Lifecycle</h4>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-3)", lineHeight: 1.4, marginBottom: "0.75rem" }}>Active timeline progress calculated under corporate SLAs:</p>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                            <span style={{ color: "var(--text-2)" }}>SLA Status:</span>
                            <span style={{ color: "#4ade80", fontWeight: 600 }}>SLA Met (92% remaining)</span>
                          </div>
                          <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", marginTop: "4px" }}>
                            <div style={{ width: "92%", height: "100%", background: "#4ade80" }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: RESOLUTION INFO & TIME METRICS */}
                  {drawerTab === "resolution" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1rem" }}>
                        <h4 style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--p3)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Resolution Details</h4>
                        
                        {["Resolved", "Closed"].includes(selected.status) ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={serviceNowFieldStyle}>
                              <span style={serviceNowLabelStyle}>Resolution Code</span>
                              <span style={serviceNowValueStyle}>Solved (Permanent Fix applied)</span>
                            </div>
                            <div style={serviceNowFieldStyle}>
                              <span style={serviceNowLabelStyle}>Resolved By</span>
                              <span style={serviceNowValueStyle}>{selected.assigned_staff?.full_name || "Sys Administrator"}</span>
                            </div>
                            <div style={serviceNowFieldStyle}>
                              <span style={serviceNowLabelStyle}>Resolved Timestamp</span>
                              <span style={serviceNowValueStyle}>{new Date(selected.updatedAt).toLocaleString()}</span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: "1rem 0.5rem", textAlign: "center", color: "var(--text-3)", fontStyle: "italic", fontSize: "0.78rem" }}>
                            <ShieldAlert size={18} style={{ display:"block", margin:"0 auto 8px", color:"#fbbf24" }}/>
                            SLA target resolving in progress. Details will register once marked resolved.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* Feedback */}
                {selected.status === "Resolved" && !feedbackSent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: "rgba(255,255,255,0.015)",
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
