import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { 
  X, Clock, MessageSquare, ChevronRight, ChevronDown, TicketIcon, 
  Send, Search, Filter, Plus, Calendar, AlertCircle, 
  CornerDownRight, ShieldAlert, Lock, RotateCcw,
  CheckCircle2, Play, Pause, Bookmark
} from "lucide-react";
import io from "socket.io-client";

const statusBadge = {
  Open:          "badge badge-blue",
  Assigned:      "badge badge-yellow",
  "In Progress": "badge badge-blue",
  Resolved:      "badge badge-green",
  Closed:        "badge badge-gray",
  New:           "badge badge-yellow"
};

const priorityBadge = {
  Low: "badge badge-green", Medium: "badge badge-yellow",
  High: "badge badge-red",  Critical: "badge badge-red",
};

const statusColors = {
  Open:          "#3b82f6",
  Assigned:      "#f59e0b",
  "In Progress": "#2563EB",
  Resolved:      "#10b981",
  Closed:        "#6b7280",
  New:           "#f59e0b"
};

export default function AssignedTickets() {
  const [tickets,       setTickets]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedId,    setSelectedId]    = useState(null);
  const [detailedTicket, setDetailedTicket] = useState(null);
  const [comments,      setComments]      = useState([]);
  const [newComment,    setNewComment]    = useState("");
  const [isInternal,    setIsInternal]    = useState(false);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("All");
  
  // ServiceNow Tab inside the detailed drawer
  const [drawerTab,     setDrawerTab]     = useState("notes");

  const loadTickets = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await api.get("/tickets/assigned");
      setTickets(r.data);
    } catch (err) {
      console.error(err);
    }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    loadTickets();
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "http://localhost:5000");
    const socket = io(socketUrl);
    
    socket.on("tickets:update", () => {
      loadTickets(true);
      if (selectedId) fetchDetail(selectedId, true);
    });
    
    return () => socket.disconnect();
  }, [selectedId]);

  const fetchDetail = async (id, silent = false) => {
    try {
      const [tRes, cRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`)
      ]);
      setDetailedTicket(tRes.data);
      setComments(cRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedId) {
      fetchDetail(selectedId);
      setDrawerTab("notes");
    } else {
      setDetailedTicket(null);
      setComments([]);
    }
  }, [selectedId]);

  const handleUpdateStatus = async (status) => {
    if (!detailedTicket) return;
    try {
      await api.put(`/tickets/${detailedTicket.id}`, { status });
      fetchDetail(detailedTicket.id);
      loadTickets(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !detailedTicket) return;
    try {
      const res = await api.post(`/tickets/${detailedTicket.id}/comments`, { 
        body: newComment,
        is_internal: isInternal 
      });
      setComments(prev => [...prev, res.data]);
      setNewComment("");
      setIsInternal(false);
      // reload detail to fetch log activity
      fetchDetail(detailedTicket.id);
    } catch (err) {
      console.error(err);
    }
  };

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

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "55vh" }}>
      <div className="spinner" style={{ width: "40px", height: "40px", borderWidth: "3px" }} />
    </div>
  );

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto", paddingBottom: "4rem" }}>

      {/* ServiceNow Breadcrumbs Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ITIL Navigator &gt; Assigned Tickets
          </span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-1)", marginTop: "4px" }}>
            My Assigned Incidents & Requests
          </h1>
        </div>
        
        <div style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.72rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: "4px", color: "var(--text-2)" }}>
          <span style={{ color: "var(--text-3)" }}>Query Filter:</span>
          <strong>All &gt; Assigned to = Me {filterStatus !== "All" && `> State = ${filterStatus}`}</strong>
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
                <option value="New">New</option>
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <Filter size={11} style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            </div>
          </div>
        </div>

        {/* List table */}
        {filteredTickets.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📁</div>
            <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>No matching assigned records found.</p>
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
                  <th style={{ paddingRight: "1.5rem", width: "140px" }}>Caller</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(t => (
                  <tr key={t.id} onClick={() => setSelectedId(t.id)} style={{ cursor: "pointer" }}>
                    <td style={{ paddingLeft: "1.5rem" }}>
                      <span className="ticket-chip" style={{ background: "rgba(53,122,112,0.06)", fontSize: "0.7rem" }}>
                        {t.ticket_number}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-2)", fontSize: "0.78rem" }}>
                      {new Date(t.createdAt || t.created_at).toLocaleDateString()}
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
                      {t.author_name || "Guest"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Ticket Rectification Detail Modal (ServiceNow Drawer) ── */}
      <AnimatePresence>
        {selectedId && detailedTicket && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 999,
              background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
              display: "flex", justifyContent: "flex-end"
            }}
          >
            <motion.div
              initial={{ x: "100%" }} 
              animate={{ x: 0, transition: { type: "spring", damping: 26, stiffness: 220 } }} 
              exit={{ x: "100%", transition: { duration: 0.2 } }}
              onClick={e => e.stopPropagation()}
              style={{ 
                background: "#0c1416", 
                borderLeft: "1px solid rgba(53,122,112,0.2)", 
                width: "100%", 
                maxWidth: "580px", 
                height: "100%", 
                overflowY: "auto", 
                padding: "1.75rem", 
                display: "flex", 
                flexDirection: "column", 
                gap: "1.25rem", 
                position: "relative", 
                boxShadow: "-10px 0 40px rgba(0,0,0,0.5)" 
              }}
            >

              {/* Close Drawer Button */}
              <button onClick={() => setSelectedId(null)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "rgba(255,255,255,0.06)", border: "none", color: "var(--text-2)", cursor: "pointer", padding: "6px", borderRadius: "6px", zIndex: 10 }}>
                <X size={16} />
              </button>

              {/* ServiceNow Navigation Header */}
              <div style={{ marginBottom: "-0.5rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  ITIL Desk &gt; Assigned &gt; {detailedTicket.ticket_number}
                </span>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-1)", lineHeight: 1.35, marginTop: "4px" }}>
                  {detailedTicket.subject}
                </h2>
              </div>

              {/* Rectification State Controls */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <span className={statusBadge[detailedTicket.status] || "badge badge-gray"}>{detailedTicket.status}</span>
                <span className={priorityBadge[detailedTicket.priority] || "badge badge-gray"}>{detailedTicket.priority} Priority</span>
                
                {/* State Transition Action Shortcuts */}
                <div style={{ display: "flex", gap: "5px", marginLeft: "auto" }}>
                  {detailedTicket.status === "New" && (
                    <button onClick={() => handleUpdateStatus("Open")} className="btn btn-secondary btn-sm" style={{ padding: "3px 8px", fontSize: "0.72rem" }}>
                      <Play size={10} style={{ marginRight: "3px" }}/> Open
                    </button>
                  )}
                  {["Open", "Assigned"].includes(detailedTicket.status) && (
                    <button onClick={() => handleUpdateStatus("In Progress")} className="btn btn-secondary btn-sm" style={{ padding: "3px 8px", fontSize: "0.72rem" }}>
                      <Play size={10} style={{ marginRight: "3px" }}/> Work
                    </button>
                  )}
                  {detailedTicket.status === "In Progress" && (
                    <button onClick={() => handleUpdateStatus("Resolved")} className="btn btn-primary btn-sm" style={{ padding: "3px 10px", fontSize: "0.72rem", background: "#10b981", borderColor: "#10b981" }}>
                      <CheckCircle2 size={10} style={{ marginRight: "3px" }}/> Resolve
                    </button>
                  )}
                  {["Resolved", "Closed"].includes(detailedTicket.status) && (
                    <button onClick={() => handleUpdateStatus("In Progress")} className="btn btn-secondary btn-sm" style={{ padding: "3px 8px", fontSize: "0.72rem" }}>
                      <RotateCcw size={10} style={{ marginRight: "3px" }}/> Reopen
                    </button>
                  )}
                </div>
              </div>

              {/* ServiceNow Two-Column Form Alignment Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1.25rem", padding: "0.85rem 1.1rem", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(53,122,112,0.1)", borderRadius: "var(--r-sm)" }}>
                
                <div style={serviceNowFieldStyle}>
                  <span style={serviceNowLabelStyle}>Caller (Reporter)</span>
                  <span style={serviceNowValueStyle}>{detailedTicket.author?.full_name || detailedTicket.author_name || "Guest"}</span>
                </div>
                <div style={serviceNowFieldStyle}>
                  <span style={serviceNowLabelStyle}>Opened At</span>
                  <span style={serviceNowValueStyle}>{new Date(detailedTicket.createdAt || detailedTicket.created_at).toLocaleDateString()} {new Date(detailedTicket.createdAt || detailedTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div style={serviceNowFieldStyle}>
                  <span style={serviceNowLabelStyle}>Category</span>
                  <span style={serviceNowValueStyle}>{detailedTicket.category_name || "N/A"}</span>
                </div>
                <div style={serviceNowFieldStyle}>
                  <span style={serviceNowLabelStyle}>State (Status)</span>
                  <div style={{ position: "relative" }}>
                    <select
                      value={detailedTicket.status}
                      onChange={e => handleUpdateStatus(e.target.value)}
                      className="input"
                      style={{ fontSize: "0.8rem", padding: "0.25rem 2rem 0.25rem 0.5rem", background: "transparent", border: "1px solid rgba(53,122,112,0.2)", width: "100%", cursor: "pointer", color: "var(--text-1)" }}
                    >
                      <option value="New" style={{ background: "#0c0f1d" }}>New</option>
                      <option value="Open" style={{ background: "#0c0f1d" }}>Open</option>
                      <option value="Assigned" style={{ background: "#0c0f1d" }}>Assigned</option>
                      <option value="In Progress" style={{ background: "#0c0f1d" }}>In Progress</option>
                      <option value="Resolved" style={{ background: "#0c0f1d" }}>Resolved</option>
                      <option value="Closed" style={{ background: "#0c0f1d" }}>Closed</option>
                    </select>
                    <ChevronDown size={11} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }} />
                  </div>
                </div>

                <div style={serviceNowFieldStyle}>
                  <span style={serviceNowLabelStyle}>Impact</span>
                  <span style={serviceNowValueStyle}>{detailedTicket.impact || "Low"}</span>
                </div>
                <div style={serviceNowFieldStyle}>
                  <span style={serviceNowLabelStyle}>Urgency</span>
                  <span style={serviceNowValueStyle}>{detailedTicket.urgency || "Low"}</span>
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
                    
                    {/* Short & Detailed description */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "6px", padding: "0.75rem" }}>
                        <p style={serviceNowLabelStyle}>Short Description</p>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-1)", fontWeight: 600, marginTop: "4px" }}>{detailedTicket.subject}</p>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "6px", padding: "0.75rem" }}>
                        <p style={serviceNowLabelStyle}>Description</p>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.5, whiteSpace: "pre-wrap", marginTop: "4px" }}>{detailedTicket.description}</p>
                      </div>
                      
                      {detailedTicket.attachment_url && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "2px 4px" }}>
                          <CornerDownRight size={12} style={{ color: "var(--p3)" }} />
                          <a href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000"}${detailedTicket.attachment_url}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.83rem", color: "var(--p3)", textDecoration: "none", fontWeight: 600 }}>
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

                      {/* Comment lists */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "170px", overflowY: "auto", paddingRight: "4px" }}>
                        {comments.map(c => (
                          <div 
                            key={c.id} 
                            style={{ 
                              background: c.is_internal ? "rgba(245,158,11,0.06)" : "rgba(16,185,129,0.06)",
                              border: `1px solid ${c.is_internal ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)"}`,
                              borderRadius: "var(--r-sm)", padding: "0.75rem",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-1)" }}>
                                {c.author?.full_name} 
                                {c.is_internal && <span style={{ marginLeft: "6px", fontSize: "0.625rem", color: "#fb923c", background: "rgba(245,158,11,0.15)", padding: "1px 5px", borderRadius: "3px" }}><Lock size={9} style={{ display:"inline", marginRight:"2px" }}/> Work Note</span>}
                              </span>
                              <span style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>{new Date(c.createdAt || c.created_at).toLocaleDateString()} {new Date(c.createdAt || c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p style={{ fontSize: "0.81rem", color: "var(--text-2)", whiteSpace: "pre-wrap", lineHeight: 1.4, margin: 0 }}>{c.body}</p>
                          </div>
                        ))}
                        {comments.length === 0 && <p style={{ fontSize: "0.8rem", color: "var(--text-3)", fontStyle: "italic", padding: "0.5rem" }}>No comments in the feed.</p>}
                      </div>

                      {/* Reply Form */}
                      {!["Resolved", "Closed"].includes(detailedTicket.status) && (
                        <form onSubmit={handleAddComment} style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                          <textarea
                            rows={2}
                            className="input"
                            placeholder="Add an update to this incident..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            style={{ resize: "none", fontSize: "0.8125rem", minHeight: "52px" }}
                          />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.75rem", color: "var(--text-2)" }}>
                              <input 
                                type="checkbox" 
                                checked={isInternal} 
                                onChange={e => setIsInternal(e.target.checked)}
                                style={{ accentColor: "#f59e0b" }}
                              />
                              <span style={{ color: "#fb923c", fontWeight: 600 }}>Work Note (Internal Comment)</span>
                            </label>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={!newComment.trim()}>
                              Post Update
                            </button>
                          </div>
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
                            {detailedTicket.category_name === "Database" ? "Supabase-PostgresDB-Cluster" : 
                             detailedTicket.category_name === "Networking" ? "ELB-LoadBalancer-Node" : "Corporate-ActiveDirectory-Server"}
                          </span>
                        </div>
                        <div style={serviceNowFieldStyle}>
                          <span style={serviceNowLabelStyle}>Asset Class</span>
                          <span style={serviceNowValueStyle}>Software / Database CI Node</span>
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
                      
                      {["Resolved", "Closed"].includes(detailedTicket.status) ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={serviceNowFieldStyle}>
                            <span style={serviceNowLabelStyle}>Resolution Code</span>
                            <span style={serviceNowValueStyle}>Solved (Permanent Fix applied)</span>
                          </div>
                          <div style={serviceNowFieldStyle}>
                            <span style={serviceNowLabelStyle}>Resolved By</span>
                            <span style={serviceNowValueStyle}>{detailedTicket.assigned_staff?.full_name || "Sys Administrator"}</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: "1rem 0.5rem", textAlign: "center", color: "var(--text-3)", fontStyle: "italic", fontSize: "0.78rem" }}>
                          <ShieldAlert size={18} style={{ display:"block", margin:"0 auto 8px", color:"#fbbf24" }}/>
                          Resolution pending. Complete tasks above and mark as Resolved.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
