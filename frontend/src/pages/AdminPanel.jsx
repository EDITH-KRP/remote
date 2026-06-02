import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { 
  Ticket, Users, BarChart2, UserCheck, ShieldCheck, Trash2, 
  ChevronDown, Download, X, MoreHorizontal, Activity, TrendingUp, 
  Clock, ArrowRight, MessageSquare, CornerDownRight, RotateCcw, Lock,
  Calendar, FileText, Database, ShieldAlert
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import io from "socket.io-client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const getToken = () => localStorage.getItem("access_token");
const STATUSES = ["Open", "Assigned", "In Progress", "Resolved", "Closed"];
const DEPT_GROUPS = ["Networking", "Windows", "Others"];

const statusColors = {
  Open:          "#3b82f6",
  Assigned:      "#f59e0b",
  "In Progress": "#2563EB",
  Resolved:      "#10b981",
  Closed:        "#6b7280",
};

const statusBadgeClass = {
  Open:          "badge-blue",
  Assigned:      "badge-yellow",
  "In Progress": "badge-blue",
  Resolved:      "badge-green",
  Closed:        "badge-gray",
};

const priorityColors = { 
  Critical: "#ef4444", 
  High:     "#f97316", 
  Medium:   "#f59e0b", 
  Low:      "#10b981" 
};

const priorityBadgeClass = {
  Critical: "badge-red",
  High:     "badge-red",
  Medium:   "badge-yellow",
  Low:      "badge-green",
};

const statConfig = [
  { key: "total_tickets",      label: "Total",       icon: Ticket,    g: "linear-gradient(135deg,#293e40,#357a70)", glow: "0 6px 24px rgba(41,62,64,0.4)", glowBg: "rgba(41,62,64,0.1)", accent: "rgba(41,62,64,0.3)" },
  { key: "open_tickets",       label: "Open",        icon: Clock,     g: "linear-gradient(135deg,#f59e0b,#d97706)", glow: "0 6px 24px rgba(245,158,11,0.4)",  glowBg: "rgba(245,158,11,0.08)", accent: "rgba(245,158,11,0.25)" },
  { key: "inprogress_tickets", label: "In Progress", icon: Activity,  g: "linear-gradient(135deg,#2563EB,#1d4ed8)", glow: "0 6px 24px rgba(37,99,235,0.4)", glowBg: "rgba(37,99,235,0.08)", accent: "rgba(37,99,235,0.25)" },
  { key: "resolved_tickets",   label: "Resolved",    icon: UserCheck, g: "linear-gradient(135deg,#10b981,#059669)", glow: "0 6px 24px rgba(16,185,129,0.4)", glowBg: "rgba(16,185,129,0.08)", accent: "rgba(16,185,129,0.25)" },
];

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(22,31,34,0.97)",
      border: "1px solid rgba(129,179,184,0.25)",
      borderRadius: "12px",
      padding: "10px 14px",
      backdropFilter: "blur(16px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      minWidth: "130px",
    }}>
      <p style={{ fontWeight: 700, color: "var(--text-1)", fontSize: "0.8rem", marginBottom: "6px" }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ fontSize: "0.78rem", color: p.dataKey === "created" ? "#81b3b8" : "#34d399", marginBottom: "2px" }}>
          <span style={{ opacity: 0.7 }}>{p.dataKey === "created" ? "Created" : "Resolved"}:</span> {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminPanel() {
  const [tickets,           setTickets]           = useState([]);
  const [users,             setUsers]             = useState([]);
  const [reports,           setReports]           = useState(null);
  const [availableStaff,    setAvailableStaff]    = useState({ Networking: [], Windows: [], Others: [] });
  const [activityData,      setActivityData]      = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [tab,               setTab]               = useState("dashboard"); // dashboard, tickets, users
  const [selectedId,        setSelectedId]        = useState(null);
  
  // Detailed single ticket comments and logs
  const [detailedTicket,    setDetailedTicket]    = useState(null);
  const [detailedComments,  setDetailedComments]  = useState([]);
  const [newComment,        setNewComment]        = useState("");
  const [isInternal,        setIsInternal]        = useState(false);

  // ServiceNow Incident Form Drawer Tab: notes, related, resolution
  const [drawerTab,         setDrawerTab]         = useState("notes");

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [tR, uR, rR, aR, actR] = await Promise.all([
        api.get("/tickets?all=true"),
        api.get("/admin/users"),
        api.get("/admin/reports"),
        api.get("/admin/available-staff"),
        api.get("/admin/activity"),
      ]);
      setTickets(tR.data); 
      setUsers(uR.data); 
      setReports(rR.data); 
      setAvailableStaff(aR.data);
      setActivityData(actR.data);
    } catch(e) { 
      console.error(e); 
    }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    load();
    const base = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "http://localhost:5000");
    const s = io(base);
    s.on("tickets:update", () => load(true));
    return () => s.disconnect();
  }, []);

  // Fetch full details and comments on select
  useEffect(() => {
    if (selectedId) {
      setDrawerTab("notes");
      Promise.all([
        api.get(`/tickets/${selectedId}`),
        api.get(`/tickets/${selectedId}/comments`)
      ]).then(([tRes, cRes]) => {
        setDetailedTicket(tRes.data);
        setDetailedComments(cRes.data);
      }).catch(console.error);
    } else {
      setDetailedTicket(null);
      setDetailedComments([]);
    }
  }, [selectedId]);

  const updateStatus = async (id, status) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    await api.put(`/tickets/${id}`, { status });
    load(true);
    // update drawer if currently active
    if (selectedId === id) {
      const tRes = await api.get(`/tickets/${id}`);
      setDetailedTicket(tRes.data);
    }
  };

  const onDragEnd = ({ destination, source, draggableId }) => {
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    // System-managed statuses shouldn't be manually targeted by dragging
    if (destination.droppableId === "Open" || destination.droppableId === "Assigned") {
      alert("Statuses 'Open' and 'Assigned' are managed by the system. Use the actions panel to assign groups/staff.");
      return;
    }
    
    updateStatus(parseInt(draggableId), destination.droppableId);
  };

  const assignGroup = async (ticketId, group) => {
    await api.post("/admin/assign-ticket", { ticket_id: ticketId, assigned_group: group || null });
    load(true);
    if (selectedId === ticketId) {
      const tRes = await api.get(`/tickets/${ticketId}`);
      setDetailedTicket(tRes.data);
    }
  };

  const assignStaff = async (ticketId, staffId) => {
    await api.post("/admin/assign-ticket", { ticket_id: ticketId, staff_id: staffId || null });
    load(true);
    if (selectedId === ticketId) {
      const tRes = await api.get(`/tickets/${ticketId}`);
      setDetailedTicket(tRes.data);
    }
  };

  const reopenTicket = async (id) => {
    const targetStatus = "In Progress";
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: targetStatus } : t));
    await api.put(`/tickets/${id}`, { status: targetStatus });
    load(true);
    if (selectedId === id) {
      const [tRes, cRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`)
      ]);
      setDetailedTicket(tRes.data);
      setDetailedComments(cRes.data);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedId) return;
    try {
      const res = await api.post(`/tickets/${selectedId}/comments`, { 
        body: newComment,
        is_internal: isInternal 
      });
      setDetailedComments(prev => [...prev, res.data]);
      setNewComment("");
      setIsInternal(false);
      
      // Refresh detailed view to log the note
      const tRes = await api.get(`/tickets/${selectedId}`);
      setDetailedTicket(tRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;
    await api.delete(`/tickets/${id}`);
    if (selectedId === id) setSelectedId(null);
    load(true);
  };

  const updateUserRole = async (userId, role) => {
    await api.patch(`/admin/users/${userId}/role`, { role });
    load(true);
  };

  const updateUserDept = async (userId, department) => {
    await api.patch(`/admin/users/${userId}/department`, { department });
    load(true);
  };

  const selectedTicket = tickets.find(t => t.id === selectedId);
  const selectedAuthor = selectedTicket ? (users.find(u => u.id === selectedTicket.user_id) || {}) : {};
  const activeGroup = selectedTicket ? (selectedTicket.assigned_group || (selectedTicket.assigned_staff_id ? (users.find(u => u.id === selectedTicket.assigned_staff_id)?.department || "Others") : "")) : "";

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "58vh", gap: "1rem" }}>
      <div className="spinner" style={{ width: "44px", height: "44px", borderWidth: "3px" }} />
      <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>Loading control center…</p>
    </div>
  );

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "4rem" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
          <ShieldCheck size={14} style={{ color: "var(--p3)" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--p3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin</span>
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text-1)" }}>Control Center</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-2)", marginTop: "4px" }}>Manage tickets, monitor dashboard, and administer staff.</p>
      </motion.div>

      {/* Unified Tab Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.375rem" }}>
        <div style={{ display: "inline-flex", gap: "4px", padding: "4px", background: "rgba(9,11,22,0.85)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", backdropFilter: "blur(16px)" }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: <TrendingUp size={14}/> },
            { id: "tickets",   label: "Board",     icon: <Ticket size={14}/>,     count: tickets.length },
            { id: "users",     label: "Users",     icon: <Users size={14}/>,      count: users.length }
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)} 
              style={{ 
                display: "flex", alignItems: "center", gap: "7px", padding: "0.45rem 1rem", 
                borderRadius: "var(--r-sm)", fontSize: "0.845rem", fontWeight: 600, border: "none", 
                cursor: "pointer", fontFamily: "inherit", 
                background: tab === t.id ? "rgba(129,179,184,0.12)" : "transparent", 
                color: tab === t.id ? "#81b3b8" : "var(--text-2)" 
              }}
            >
              {t.icon} {t.label}
              {t.count !== undefined && (
                <span style={{ padding: "1px 7px", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 800, background: tab === t.id ? "rgba(129,179,184,0.18)" : "rgba(255,255,255,0.05)", color: tab === t.id ? "#81b3b8" : "var(--text-3)" }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <button onClick={() => window.open(`${API_URL}/admin/export?token=${getToken()}`, "_blank")} className="btn btn-secondary" style={{ padding: "0.45rem 1rem", fontSize: "0.845rem" }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Dashboard (Overview & Weekly Activity) ── */}
        {tab === "dashboard" && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            
            {/* Stats Cards */}
            {reports && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem" }}>
                {statConfig.map(s => {
                  const Icon = s.icon;
                  return (
                    <motion.div 
                      key={s.key} 
                      whileHover={{ y: -4, border: `1px solid ${s.accent}` }} 
                      style={{ 
                        background: "rgba(22,31,34,0.82)", border: "1px solid rgba(129,179,184,0.12)", 
                        borderRadius: "var(--r-lg)", padding: "1.25rem 1.5rem", display: "flex", 
                        alignItems: "center", gap: "1rem", backdropFilter: "blur(20px)", position: "relative",
                        overflow: "hidden"
                      }}
                    >
                      <div style={{
                        position: "absolute", top: 0, right: 0, width: "80px", height: "80px",
                        background: `radial-gradient(circle at top right, ${s.glowBg} 0%, transparent 70%)`,
                        borderRadius: "50%", transform: "translate(30%,-30%)", pointerEvents: "none"
                      }} />
                      <div style={{ width: "48px", height: "48px", borderRadius: "var(--r-md)", background: s.g, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: s.glow, flexShrink: 0 }}>
                        <Icon size={20} color="#fff" />
                      </div>
                      <div>
                        <p style={{ fontSize: "1.875rem", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1, color: "var(--text-1)" }}>{reports[s.key] ?? 0}</p>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-2)", fontWeight: 500, marginTop: "3px" }}>{s.label}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Layout Grid: Recent Feed + Weekly Graph */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }} className="lg:grid-cols-dash">
              
              {/* Recent ticket logs feed */}
              <div style={{ background: "rgba(22,31,34,0.82)", border: "1px solid rgba(129,179,184,0.12)", borderRadius: "var(--r-lg)", backdropFilter: "blur(20px)", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 1.5rem", borderBottom: "1px solid rgba(129,179,184,0.09)", background: "rgba(53,122,112,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "linear-gradient(135deg,#357a70,#81b3b8)", boxShadow: "0 0 8px rgba(129,179,184,0.8)" }} />
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-1)" }}>Recent Ticket Feed</span>
                  </div>
                  <button onClick={() => setTab("tickets")} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", fontWeight: 600, color: "var(--p3)", background: "none", border: "none", cursor: "pointer" }}>
                    Manage all <ArrowRight size={13} />
                  </button>
                </div>
                
                {tickets.length === 0 ? (
                  <div style={{ padding: "3.5rem", textAlign: "center" }}>
                    <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>No tickets available.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ paddingLeft: "1.5rem" }}>Ticket</th>
                          <th>Subject</th>
                          <th>Reporter</th>
                          <th>Status</th>
                          <th style={{ paddingRight: "1.5rem" }}>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.slice(0, 6).map((t, idx) => (
                          <tr key={t.id} onClick={() => setSelectedId(t.id)} style={{ cursor: "pointer" }}>
                            <td style={{ paddingLeft: "1.5rem" }}><span className="ticket-chip">{t.ticket_number}</span></td>
                            <td style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-2)" }}>{t.subject}</td>
                            <td style={{ color: "var(--text-2)" }}>{t.author_name || "Guest"}</td>
                            <td><span className={`badge ${statusBadgeClass[t.status] || "badge-gray"}`}>{t.status}</span></td>
                            <td style={{ paddingRight: "1.5rem" }}><span className={`badge ${priorityBadgeClass[t.priority] || "badge-gray"}`}>{t.priority}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Weekly Trend Chart */}
              <div style={{ background: "rgba(22,31,34,0.82)", border: "1px solid rgba(129,179,184,0.12)", borderRadius: "var(--r-lg)", backdropFilter: "blur(20px)", padding: "1.25rem 1.5rem 1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "linear-gradient(135deg,#34d399,#10b981)", boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-1)" }}>Weekly Ticket Activity</span>
                </div>
                
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={activityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gCreatedAdmin"  x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#357a70" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#357a70" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gResolvedAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(129,179,184,0.07)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-3)", fontSize: 11 }} dy={4} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="created"  stroke="#357a70" strokeWidth={2} fill="url(#gCreatedAdmin)"  dot={{ fill: "#357a70", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fill="url(#gResolvedAdmin)" dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>

                <div style={{ display: "flex", gap: "1.25rem", justifyContent: "center", marginTop: "8px" }}>
                  {[{ c: "#357a70", l: "Created" }, { c: "#10b981", l: "Resolved" }].map(({ c, l }) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-2)" }}>
                      <div style={{ width: "10px", height: "3px", borderRadius: "99px", background: c }} />
                      {l}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ── Kanban Board ── */}
        {tab === "tickets" && (
          <motion.div key="tickets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={{ display: "flex", gap: "0.875rem", overflowX: "auto", paddingBottom: "1rem" }}>
                {STATUSES.map(status => {
                  const col = tickets.filter(t => t.status === status);
                  const accent = statusColors[status];
                  return (
                    <div key={status} style={{ minWidth: "272px", flex: "0 0 272px", background: "rgba(22,31,34,0.6)", border: "1px solid rgba(129,179,184,0.1)", borderRadius: "10px", display: "flex", flexDirection: "column" }}>
                      <div style={{ padding: "0.75rem 1rem", borderBottom: `2px solid ${accent}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent }} />
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-1)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{status}</span>
                        </div>
                        <span style={{ fontSize: "0.72rem", background: `${accent}22`, color: accent, padding: "2px 8px", borderRadius: "99px", fontWeight: 700 }}>{col.length}</span>
                      </div>
                      <Droppable droppableId={status}>
                        {(prov, snap) => (
                          <div ref={prov.innerRef} {...prov.droppableProps} style={{ padding: "0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.625rem", background: snap.isDraggingOver ? `${accent}08` : "transparent", transition: "background 0.2s", minHeight: "120px" }}>
                            {col.map((ticket, idx) => (
                              <Draggable key={ticket.id} draggableId={ticket.id.toString()} index={idx}>
                                {(dp, ds) => (
                                  <div
                                    ref={dp.innerRef} {...dp.draggableProps} {...dp.dragHandleProps}
                                    onClick={() => setSelectedId(ticket.id)}
                                    style={{ background: ds.isDragging ? "rgba(20,23,40,0.98)" : "rgba(22,31,34,0.92)", border: `1px solid ${ds.isDragging ? accent + "66" : "rgba(129,179,184,0.12)"}`, borderRadius: "8px", padding: "0.85rem", cursor: "pointer", boxShadow: ds.isDragging ? `0 12px 28px rgba(0,0,0,0.5),0 0 0 1px ${accent}44` : "0 2px 4px rgba(0,0,0,0.15)", ...dp.draggableProps.style }}
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                      <span style={{ fontSize: "0.68rem", color: accent, fontWeight: 700, background: `${accent}18`, padding: "2px 6px", borderRadius: "4px" }}>{ticket.ticket_number}</span>
                                      <MoreHorizontal size={13} style={{ color: "var(--text-3)" }} />
                                    </div>
                                    <h3 style={{ fontSize: "0.845rem", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.4, marginBottom: "10px" }}>{ticket.subject}</h3>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                      <span style={{ fontSize: "0.68rem", color: priorityColors[ticket.priority] || "var(--text-3)", background: `${priorityColors[ticket.priority] || "#666"}18`, padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>{ticket.priority || "Low"}</span>
                                      {ticket.assigned_staff_id && (
                                        <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "linear-gradient(135deg,#357a70,#81b3b8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.58rem", color: "#fff", fontWeight: 800 }} title="Assigned">A</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {prov.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          </motion.div>
        )}

        {/* ── Users ── */}
        {tab === "users" && (
          <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} style={{ background: "rgba(22,31,34,0.82)", border: "1px solid rgba(129,179,184,0.12)", borderRadius: "var(--r-lg)", backdropFilter: "blur(20px)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: "1.5rem" }}>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th style={{ paddingRight: "1.5rem" }}>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const initials = u.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
                    const gradMap = { admin: "linear-gradient(135deg,#ef4444,#dc2626)", support: "linear-gradient(135deg,#357a70,#81b3b8)", user: "linear-gradient(135deg,#293e40,#161f22)" };
                    return (
                      <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                        <td style={{ paddingLeft: "1.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, background: gradMap[u.role] || gradMap.user, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.7rem", fontWeight: 800 }}>{initials}</div>
                            <span style={{ fontWeight: 600, color: "var(--text-1)", fontSize: "0.875rem" }}>{u.full_name}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>{u.email}</td>
                        <td>
                          <div style={{ position: "relative" }}>
                            <select value={u.role} onChange={e => updateUserRole(u.id, e.target.value)} className="input" style={{ fontSize: "0.8rem", padding: "0.3rem 2rem 0.3rem 0.5rem", width: "auto", cursor: "pointer", appearance: "none", WebkitAppearance: "none", background: "transparent", border: "1px solid rgba(129,179,184,0.2)" }}>
                              {["user", "support", "admin"].map(r => <option key={r} value={r} style={{ background: "#0c0f1d" }}>{r}</option>)}
                            </select>
                            <ChevronDown size={12} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }} />
                          </div>
                        </td>
                        <td>
                          {(u.role === "support" || u.role === "admin") ? (
                            <div style={{ position: "relative" }}>
                              <select value={u.department || "Others"} onChange={e => updateUserDept(u.id, e.target.value)} className="input" style={{ fontSize: "0.8rem", padding: "0.3rem 2rem 0.3rem 0.5rem", width: "auto", cursor: "pointer", appearance: "none", WebkitAppearance: "none", background: "transparent", border: "1px solid rgba(129,179,184,0.2)" }}>
                                {DEPT_GROUPS.map(d => <option key={d} value={d} style={{ background: "#0c0f1d" }}>{d}</option>)}
                              </select>
                              <ChevronDown size={12} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }} />
                            </div>
                          ) : <span style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>—</span>}
                        </td>
                        <td style={{ color: "var(--text-3)", fontSize: "0.875rem", paddingRight: "1.5rem" }}>{u.phone || "—"}</td>
                      </motion.tr>
                    );
                  })}
                  {users.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-3)", padding: "2.5rem" }}>No users found.</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Side Panel (ServiceNow-Aligned Tabbed Detail Form) ── */}
      <AnimatePresence>
        {selectedId && selectedTicket && detailedTicket && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)", display: "flex", justifyContent: "flex-end" }} onClick={() => setSelectedId(null)}>
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0, transition: { type: "spring", damping: 26, stiffness: 220 } }} exit={{ x: "100%", transition: { duration: 0.2 } }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#0c1416", borderLeft: "1px solid rgba(53,122,112,0.2)", width: "100%", maxWidth: "560px", height: "100%", overflowY: "auto", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem", position: "relative", boxShadow: "-10px 0 40px rgba(0,0,0,0.5)" }}
            >
              
              {/* Close Drawer Button */}
              <button onClick={() => setSelectedId(null)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "rgba(255,255,255,0.06)", border: "none", color: "var(--text-2)", cursor: "pointer", padding: "6px", borderRadius: "6px", zIndex: 10 }}>
                <X size={16} />
              </button>

              {/* ServiceNow Incident Navigation Header */}
              <div style={{ marginBottom: "-0.5rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  ITIL Desk &gt; {detailedTicket.ticket_type === "Request" ? "Requests" : "Incidents"} &gt; {detailedTicket.ticket_number}
                </span>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-1)", lineHeight: 1.35, marginTop: "4px" }}>
                  {detailedTicket.subject}
                </h2>
              </div>

              {/* Form Status Bar */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                <span className={`badge ${statusBadgeClass[detailedTicket.status] || "badge-gray"}`}>{detailedTicket.status}</span>
                <span className={`badge ${priorityBadgeClass[detailedTicket.priority] || "badge-gray"}`}>{detailedTicket.priority} Priority</span>
                {detailedTicket.ticket_type && <span className="badge badge-indigo">{detailedTicket.ticket_type}</span>}
              </div>

              {/* ServiceNow Two-Column Form Field Alignment Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1.25rem", padding: "0.85rem 1.1rem", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(53,122,112,0.1)", borderRadius: "var(--r-sm)" }}>
                
                <div style={serviceNowFieldStyle}>
                  <span style={serviceNowLabelStyle}>Caller (Reporter)</span>
                  <span style={serviceNowValueStyle}>{selectedAuthor.full_name || detailedTicket.author_name || "Guest"}</span>
                </div>
                <div style={serviceNowFieldStyle}>
                  <span style={serviceNowLabelStyle}>Opened At</span>
                  <span style={serviceNowValueStyle}>{new Date(detailedTicket.createdAt).toLocaleDateString()} {new Date(detailedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div style={serviceNowFieldStyle}>
                  <span style={serviceNowLabelStyle}>Category</span>
                  <span style={serviceNowValueStyle}>{detailedTicket.category_name || "N/A"}</span>
                </div>
                <div style={serviceNowFieldStyle}>
                  <span style={serviceNowLabelStyle}>State (Status)</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: statusColors[detailedTicket.status] }}>{detailedTicket.status}</span>
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

              {/* ServiceNow Incident Multi-Tabs Navigation Bar */}
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
                        <p style={{ fontSize: "0.85rem", color: "var(--text-1)", fontWeight: 600, marginTop: "4px" }}>{detailedTicket.subject}</p>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "6px", padding: "0.75rem" }}>
                        <p style={serviceNowLabelStyle}>Description</p>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.5, whiteSpace: "pre-wrap", marginTop: "4px" }}>{detailedTicket.description}</p>
                      </div>
                      
                      {detailedTicket.attachment_url && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "2px 4px" }}>
                          <CornerDownRight size={12} style={{ color: "var(--p3)" }} />
                          <a href={`${API_URL.replace("/api", "")}${detailedTicket.attachment_url}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.83rem", color: "var(--p3)", textDecoration: "none", fontWeight: 600 }}>
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
                          Activity Stream ({detailedComments.length})
                        </span>
                      </div>

                      {/* Comment list with signature ServiceNow Work Notes orange color & customer comments blue color */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "170px", overflowY: "auto", paddingRight: "4px" }}>
                        {detailedComments.map(c => {
                          const workNoteBg = isDarkMode ? "#2e2112" : "#fffbeb";
                          const workNoteBorder = "rgba(245,158,11,0.25)";
                          const commentBg = isDarkMode ? "#12201c" : "#f0fdf4";
                          const commentBorder = "rgba(16,185,129,0.25)";
                          
                          return (
                            <div 
                              key={c.id} 
                              style={{ 
                                background: c.is_internal ? workNoteBg : commentBg,
                                border: `1px solid ${c.is_internal ? workNoteBorder : commentBorder}`,
                                borderRadius: "var(--r-sm)", padding: "0.75rem",
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
                          );
                        })}
                        {detailedComments.length === 0 && <p style={{ fontSize: "0.8rem", color: "var(--text-3)", fontStyle: "italic", padding: "0.5rem" }}>No comments in the feed.</p>}
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
                          <div style={serviceNowFieldStyle}>
                            <span style={serviceNowLabelStyle}>Resolved Timestamp</span>
                            <span style={serviceNowValueStyle}>{new Date(detailedTicket.updatedAt).toLocaleString()}</span>
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

              {/* Assignment Controls Section */}
              <div style={{ padding: "0.85rem", background: "rgba(53,122,112,0.05)", border: "1px solid rgba(53,122,112,0.18)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                <p style={serviceNowLabelStyle}>ITIL Incident Routing Assignment</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {/* Assign Group */}
                  <div style={{ position: "relative", flex: 1 }}>
                    <select value={activeGroup} onChange={e => assignGroup(detailedTicket.id, e.target.value)} className="input" style={{ fontSize: "0.8rem", padding: "0.42rem 2rem 0.42rem 0.75rem", width: "100%", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}>
                      <option value="">Assign Group…</option>
                      {DEPT_GROUPS.map(d => <option key={d} value={d} style={{ background: "#0c0f1d" }}>{d} Dept</option>)}
                    </select>
                    <ChevronDown size={12} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }} />
                  </div>
                  {/* Assigned Staff */}
                  <div style={{ position: "relative", flex: 1 }}>
                    <select value={detailedTicket.assigned_staff_id || ""} onChange={e => assignStaff(detailedTicket.id, e.target.value)} className="input" style={{ fontSize: "0.8rem", padding: "0.42rem 2rem 0.42rem 0.75rem", width: "100%", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }} disabled={!activeGroup}>
                      <option value="">Assigned Staff…</option>
                      {activeGroup && (() => {
                        const members = availableStaff[activeGroup] || [];
                        if (members.length === 0) {
                          return <option disabled style={{ background: "#0c0f1d", color: "#666" }}>No staff in group</option>;
                        }
                        return members.map(u => (
                          <option key={u.id} value={u.id} style={{ background: "#0c0f1d" }}>
                            {u.full_name} {u.available ? "🟢" : "🟡 (Busy)"}
                          </option>
                        ));
                      })()}
                    </select>
                    <ChevronDown size={12} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }} />
                  </div>
                </div>
              </div>

              {/* Form Action Controls (Reopen or Delete) */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", flexShrink: 0 }}>
                
                {/* Reopen option for resolved/closed tickets */}
                {["Resolved", "Closed"].includes(detailedTicket.status) ? (
                  <motion.button 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.97 }} 
                    onClick={() => reopenTicket(detailedTicket.id)} 
                    className="btn" 
                    style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24", display: "flex", alignItems: "center", gap: "6px", padding: "0.55rem 1.25rem" }}
                  >
                    <RotateCcw size={14} /> Reopen Ticket
                  </motion.button>
                ) : (
                  <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontStyle: "italic" }}>
                    Status is currently managed active.
                  </span>
                )}

                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => deleteTicket(detailedTicket.id)} 
                  className="btn-danger btn-sm" 
                  style={{ padding: "0.45rem 0.75rem", borderRadius: "var(--r-sm)", border: "1px solid rgba(248,113,113,0.18)", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Trash2 size={13} /> Delete Ticket
                </motion.button>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
