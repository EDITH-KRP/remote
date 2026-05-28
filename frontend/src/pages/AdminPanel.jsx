import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { Ticket, Users, BarChart2, UserCheck, ShieldCheck, Trash2, ChevronDown, Download, X, MoreHorizontal } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const getToken = () => localStorage.getItem("access_token");
const STATUSES = ["Open","Assigned","In Progress","Resolved","Closed"];
const DEPT_GROUPS = ["Networking","Windows","Others"];

const statusColors = {
  Open:          "#3b82f6",
  Assigned:      "#f59e0b",
  "In Progress": "#8b5cf6",
  Resolved:      "#10b981",
  Closed:        "#6b7280",
};
const priorityColors = { Critical:"#ef4444", High:"#f97316", Medium:"#f59e0b", Low:"#10b981" };

const statConfig = [
  { key:"total_tickets",    label:"Total",    icon:Ticket,    g:"linear-gradient(135deg,#6366f1,#4f46e5)", glow:"0 6px 24px rgba(99,102,241,0.45)" },
  { key:"open_tickets",     label:"Open",     icon:BarChart2, g:"linear-gradient(135deg,#f59e0b,#d97706)", glow:"0 6px 24px rgba(245,158,11,0.4)" },
  { key:"resolved_tickets", label:"Resolved", icon:UserCheck, g:"linear-gradient(135deg,#10b981,#059669)", glow:"0 6px 24px rgba(16,185,129,0.4)" },
];

export default function AdminPanel() {
  const [tickets,        setTickets]        = useState([]);
  const [users,          setUsers]          = useState([]);
  const [reports,        setReports]        = useState(null);
  const [availableStaff, setAvailableStaff] = useState({ Networking:[], Windows:[], Others:[] });
  const [loading,        setLoading]        = useState(true);
  const [tab,            setTab]            = useState("tickets");
  const [selectedId,     setSelectedId]     = useState(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [tR,uR,rR,aR] = await Promise.all([
        api.get('/tickets'),
        api.get('/admin/users'),
        api.get('/admin/reports'),
        api.get('/admin/available-staff'),
      ]);
      setTickets(tR.data); setUsers(uR.data); setReports(rR.data); setAvailableStaff(aR.data);
    } catch(e) { console.error(e); }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    load();
    const base = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/,"") : "http://localhost:5000");
    const s = io(base);
    s.on("tickets:update", () => load(true));
    return () => s.disconnect();
  }, []);

  const updateStatus = async (id, status) => {
    setTickets(prev => prev.map(t => t.id===id ? {...t, status} : t));
    await api.put(`/tickets/${id}`, { status });
    load(true);
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
    await api.post('/admin/assign-ticket', { ticket_id: ticketId, assigned_group: group || null });
    load(true);
  };

  const assignStaff = async (ticketId, staffId) => {
    await api.post('/admin/assign-ticket', { ticket_id: ticketId, staff_id: staffId || null });
    load(true);
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

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"58vh", gap:"1rem" }}>
      <div className="spinner" style={{ width:"44px", height:"44px", borderWidth:"3px" }} />
      <p style={{ color:"var(--text-2)", fontSize:"0.875rem" }}>Loading admin panel…</p>
    </div>
  );

  return (
    <div style={{ maxWidth:"1280px", margin:"0 auto", paddingBottom:"4rem" }}>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"1.75rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"4px" }}>
          <ShieldCheck size={14} style={{ color:"#f87171" }} />
          <span style={{ fontSize:"0.72rem", fontWeight:700, color:"#f87171", textTransform:"uppercase", letterSpacing:"0.08em" }}>Admin</span>
        </div>
        <h1 style={{ fontSize:"1.75rem", fontWeight:900, letterSpacing:"-0.04em", color:"var(--text-1)" }}>Control Center</h1>
        <p style={{ fontSize:"0.875rem", color:"var(--text-2)", marginTop:"4px" }}>Manage tickets, users, and monitor activity.</p>
      </motion.div>

      {/* Stats */}
      {reports && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem", marginBottom:"1.75rem" }}>
          {statConfig.map(s => {
            const Icon = s.icon;
            return (
              <motion.div key={s.key} whileHover={{ y:-4 }} style={{ background:"rgba(10,12,22,0.82)", border:"1px solid rgba(99,102,241,0.12)", borderRadius:"var(--r-lg)", padding:"1.25rem 1.5rem", display:"flex", alignItems:"center", gap:"1rem", backdropFilter:"blur(20px)" }}>
                <div style={{ width:"48px", height:"48px", borderRadius:"var(--r-md)", background:s.g, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:s.glow, flexShrink:0 }}>
                  <Icon size={20} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize:"1.875rem", fontWeight:900, letterSpacing:"-0.05em", lineHeight:1, color:"var(--text-1)" }}>{reports[s.key] ?? 0}</p>
                  <p style={{ fontSize:"0.78rem", color:"var(--text-2)", fontWeight:500, marginTop:"3px" }}>{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display:"inline-flex", gap:"4px", padding:"4px", background:"rgba(9,11,22,0.85)", border:"1px solid rgba(99,102,241,0.14)", borderRadius:"var(--r-md)", marginBottom:"1.375rem", backdropFilter:"blur(16px)" }}>
        {[{ id:"tickets", label:"Board", icon:<Ticket size={14}/>, count:tickets.length }, { id:"users", label:"Users", icon:<Users size={14}/>, count:users.length }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:"7px", padding:"0.45rem 1rem", borderRadius:"var(--r-sm)", fontSize:"0.845rem", fontWeight:600, border:"none", cursor:"pointer", fontFamily:"inherit", background:tab===t.id ? "linear-gradient(135deg,rgba(99,102,241,0.22),rgba(139,92,246,0.14))" : "transparent", color:tab===t.id ? "var(--p3)" : "var(--text-2)" }}>
            {t.icon} {t.label}
            <span style={{ padding:"1px 7px", borderRadius:"99px", fontSize:"0.7rem", fontWeight:800, background:tab===t.id ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.05)", color:tab===t.id ? "var(--p3)" : "var(--text-3)" }}>{t.count}</span>
          </button>
        ))}
        <button onClick={() => window.open(`${API_URL}/admin/export?token=${getToken()}`,"_blank")} className="btn btn-secondary" style={{ padding:"0.45rem 1rem", fontSize:"0.845rem", marginLeft:"auto" }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Kanban Board ── */}
        {tab === "tickets" && (
          <motion.div key="tickets" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.22 }}>
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={{ display:"flex", gap:"0.875rem", overflowX:"auto", paddingBottom:"1rem" }}>
                {STATUSES.map(status => {
                  const col = tickets.filter(t => t.status === status);
                  const accent = statusColors[status];
                  return (
                    <div key={status} style={{ minWidth:"272px", flex:"0 0 272px", background:"rgba(10,12,22,0.6)", border:"1px solid rgba(99,102,241,0.1)", borderRadius:"10px", display:"flex", flexDirection:"column" }}>
                      <div style={{ padding:"0.75rem 1rem", borderBottom:`2px solid ${accent}22`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:accent }} />
                          <span style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--text-1)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{status}</span>
                        </div>
                        <span style={{ fontSize:"0.72rem", background:`${accent}22`, color:accent, padding:"2px 8px", borderRadius:"99px", fontWeight:700 }}>{col.length}</span>
                      </div>
                      <Droppable droppableId={status}>
                        {(prov, snap) => (
                          <div ref={prov.innerRef} {...prov.droppableProps} style={{ padding:"0.75rem", flex:1, display:"flex", flexDirection:"column", gap:"0.625rem", background:snap.isDraggingOver ? `${accent}08` : "transparent", transition:"background 0.2s", minHeight:"120px" }}>
                            {col.map((ticket, idx) => (
                              <Draggable key={ticket.id} draggableId={ticket.id.toString()} index={idx}>
                                {(dp, ds) => (
                                  <div
                                    ref={dp.innerRef} {...dp.draggableProps} {...dp.dragHandleProps}
                                    onClick={() => setSelectedId(ticket.id)}
                                    style={{ background:ds.isDragging ? "rgba(20,23,40,0.98)" : "rgba(15,18,30,0.92)", border:`1px solid ${ds.isDragging ? accent+"66" : "rgba(99,102,241,0.12)"}`, borderRadius:"8px", padding:"0.85rem", cursor:"pointer", boxShadow:ds.isDragging ? `0 12px 28px rgba(0,0,0,0.5),0 0 0 1px ${accent}44` : "0 2px 4px rgba(0,0,0,0.15)", ...dp.draggableProps.style }}
                                  >
                                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                                      <span style={{ fontSize:"0.68rem", color:accent, fontWeight:700, background:`${accent}18`, padding:"2px 6px", borderRadius:"4px" }}>{ticket.ticket_number}</span>
                                      <MoreHorizontal size={13} style={{ color:"var(--text-3)" }} />
                                    </div>
                                    <h3 style={{ fontSize:"0.845rem", fontWeight:600, color:"var(--text-1)", lineHeight:1.4, marginBottom:"10px" }}>{ticket.subject}</h3>
                                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                                      <span style={{ fontSize:"0.68rem", color:priorityColors[ticket.priority] || "var(--text-3)", background:`${priorityColors[ticket.priority] || "#666"}18`, padding:"2px 6px", borderRadius:"4px", fontWeight:600 }}>{ticket.priority || "Low"}</span>
                                      {ticket.assigned_staff_id && (
                                        <div style={{ width:"22px", height:"22px", borderRadius:"50%", background:"linear-gradient(135deg,#8b5cf6,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.58rem", color:"#fff", fontWeight:800, title:"Assigned" }}>A</div>
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
          <motion.div key="users" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.22 }} style={{ background:"rgba(10,12,22,0.82)", border:"1px solid rgba(99,102,241,0.12)", borderRadius:"var(--r-lg)", backdropFilter:"blur(20px)", overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft:"1.5rem" }}>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th style={{ paddingRight:"1.5rem" }}>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const initials = u.full_name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "?";
                    const gradMap = { admin:"linear-gradient(135deg,#ef4444,#dc2626)", support:"linear-gradient(135deg,#8b5cf6,#7c3aed)", user:"linear-gradient(135deg,#6366f1,#4f46e5)" };
                    return (
                      <motion.tr key={u.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}>
                        <td style={{ paddingLeft:"1.5rem" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                            <div style={{ width:"32px", height:"32px", borderRadius:"50%", flexShrink:0, background:gradMap[u.role]||gradMap.user, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.7rem", fontWeight:800 }}>{initials}</div>
                            <span style={{ fontWeight:600, color:"var(--text-1)", fontSize:"0.875rem" }}>{u.full_name}</span>
                          </div>
                        </td>
                        <td style={{ color:"var(--text-2)", fontSize:"0.875rem" }}>{u.email}</td>
                        <td>
                          <div style={{ position:"relative" }}>
                            <select value={u.role} onChange={e => updateUserRole(u.id, e.target.value)} className="input" style={{ fontSize:"0.8rem", padding:"0.3rem 2rem 0.3rem 0.5rem", width:"auto", cursor:"pointer", appearance:"none", WebkitAppearance:"none", background:"transparent", border:"1px solid rgba(99,102,241,0.2)" }}>
                              {["user","support","admin"].map(r => <option key={r} value={r} style={{ background:"#0c0f1d" }}>{r}</option>)}
                            </select>
                            <ChevronDown size={12} style={{ position:"absolute", right:"0.5rem", top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--text-3)" }} />
                          </div>
                        </td>
                        <td>
                          {(u.role === "support" || u.role === "admin") ? (
                            <div style={{ position:"relative" }}>
                              <select value={u.department || "Others"} onChange={e => updateUserDept(u.id, e.target.value)} className="input" style={{ fontSize:"0.8rem", padding:"0.3rem 2rem 0.3rem 0.5rem", width:"auto", cursor:"pointer", appearance:"none", WebkitAppearance:"none", background:"transparent", border:"1px solid rgba(99,102,241,0.2)" }}>
                                {DEPT_GROUPS.map(d => <option key={d} value={d} style={{ background:"#0c0f1d" }}>{d}</option>)}
                              </select>
                              <ChevronDown size={12} style={{ position:"absolute", right:"0.5rem", top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--text-3)" }} />
                            </div>
                          ) : <span style={{ color:"var(--text-3)", fontSize:"0.8rem" }}>—</span>}
                        </td>
                        <td style={{ color:"var(--text-3)", fontSize:"0.875rem", paddingRight:"1.5rem" }}>{u.phone || "—"}</td>
                      </motion.tr>
                    );
                  })}
                  {users.length === 0 && <tr><td colSpan={5} style={{ textAlign:"center", color:"var(--text-3)", padding:"2.5rem" }}>No users found.</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Side Panel ── */}
      <AnimatePresence>
        {selectedId && selectedTicket && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(3px)", display:"flex", justifyContent:"flex-end" }} onClick={() => setSelectedId(null)}>
            <motion.div
              initial={{ x:"100%" }} animate={{ x:0, transition:{ type:"spring", damping:26, stiffness:220 } }} exit={{ x:"100%", transition:{ duration:0.2 } }}
              onClick={e => e.stopPropagation()}
              style={{ background:"#0a0c16", borderLeft:"1px solid rgba(99,102,241,0.2)", width:"100%", maxWidth:"460px", height:"100%", overflowY:"auto", padding:"2rem", display:"flex", flexDirection:"column", gap:"1.25rem", position:"relative", boxShadow:"-10px 0 40px rgba(0,0,0,0.5)" }}
            >
              <button onClick={() => setSelectedId(null)} style={{ position:"absolute", top:"1.5rem", right:"1.5rem", background:"rgba(255,255,255,0.06)", border:"none", color:"var(--text-2)", cursor:"pointer", padding:"6px", borderRadius:"6px" }}>
                <X size={16} />
              </button>

              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                <span style={{ fontSize:"0.72rem", color:statusColors[selectedTicket.status], background:`${statusColors[selectedTicket.status]}18`, padding:"3px 8px", borderRadius:"5px", fontWeight:700 }}>{selectedTicket.ticket_number}</span>
                <span style={{ fontSize:"0.72rem", color:statusColors[selectedTicket.status], background:`${statusColors[selectedTicket.status]}18`, padding:"3px 8px", borderRadius:"5px", fontWeight:700 }}>{selectedTicket.status}</span>
              </div>

              <h2 style={{ fontSize:"1.25rem", fontWeight:800, color:"var(--text-1)", lineHeight:1.35 }}>{selectedTicket.subject}</h2>

              <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"8px", padding:"1rem" }}>
                <p style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.05em", color:"var(--text-3)", marginBottom:"8px", fontWeight:600 }}>Description</p>
                <p style={{ fontSize:"0.85rem", color:"var(--text-2)", lineHeight:1.65, whiteSpace:"pre-wrap" }}>{selectedTicket.description}</p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
                {[["Priority", selectedTicket.priority], ["Impact", selectedTicket.impact], ["Urgency", selectedTicket.urgency], ["Type", selectedTicket.ticket_type]].map(([label, val]) => (
                  <div key={label} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"8px", padding:"0.75rem" }}>
                    <p style={{ fontSize:"0.7rem", color:"var(--text-3)", marginBottom:"4px", textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</p>
                    <p style={{ fontSize:"0.85rem", color:"var(--text-1)", fontWeight:600 }}>{val || "N/A"}</p>
                  </div>
                ))}
              </div>

              <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"8px", padding:"0.75rem", display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.65rem", fontWeight:800, flexShrink:0 }}>
                  {(selectedAuthor.full_name || selectedTicket.author_name || "?").slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:"0.72rem", color:"var(--text-3)", marginBottom:"2px" }}>Reporter</p>
                  <p style={{ fontSize:"0.85rem", color:"var(--text-1)", fontWeight:600 }}>{selectedAuthor.full_name || selectedTicket.author_name || "N/A"}</p>
                  <p style={{ fontSize:"0.75rem", color:"var(--text-3)" }}>{selectedAuthor.email || ""}</p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ borderTop:"1px solid rgba(99,102,241,0.1)", paddingTop:"1.25rem", display:"flex", flexDirection:"column", gap:"10px", marginTop:"auto" }}>
                <p style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-1)" }}>Actions</p>
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  <div style={{ display:"flex", gap:"8px" }}>
                    {/* Assign Group */}
                    <div style={{ position:"relative", flex:1 }}>
                      <select value={activeGroup} onChange={e => assignGroup(selectedTicket.id, e.target.value)} className="input" style={{ fontSize:"0.8rem", padding:"0.42rem 2rem 0.42rem 0.75rem", width:"100%", cursor:"pointer", appearance:"none", WebkitAppearance:"none" }}>
                        <option value="">Assign Group…</option>
                        {DEPT_GROUPS.map(d => <option key={d} value={d} style={{ background:"#0c0f1d" }}>{d} Dept</option>)}
                      </select>
                      <ChevronDown size={12} style={{ position:"absolute", right:"0.5rem", top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--text-3)" }} />
                    </div>
                    {/* Assigned Staff */}
                    <div style={{ position:"relative", flex:1 }}>
                      <select value={selectedTicket.assigned_staff_id || ""} onChange={e => assignStaff(selectedTicket.id, e.target.value)} className="input" style={{ fontSize:"0.8rem", padding:"0.42rem 2rem 0.42rem 0.75rem", width:"100%", cursor:"pointer", appearance:"none", WebkitAppearance:"none" }} disabled={!activeGroup}>
                        <option value="">Assigned Staff…</option>
                        {activeGroup && (() => {
                          const members = (availableStaff[activeGroup] || [])
                            .filter(u => u.available || u.id === selectedTicket.assigned_staff_id);
                          if (members.length === 0) {
                            return <option disabled style={{ background:"#0c0f1d", color:"#666" }}>No staff in group</option>;
                          }
                          return members.map(u => (
                            <option key={u.id} value={u.id} style={{ background:"#0c0f1d" }}>{u.full_name}</option>
                          ));
                        })()}
                      </select>
                      <ChevronDown size={12} style={{ position:"absolute", right:"0.5rem", top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--text-3)" }} />
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                    {/* Status (Read-Only) */}
                    <div style={{ flex:1 }}>
                      <div style={{ 
                        fontSize:"0.8rem", 
                        padding:"0.42rem 0.85rem", 
                        width:"100%", 
                        background:"rgba(255,255,255,0.03)", 
                        border:"1px solid rgba(255,255,255,0.06)", 
                        borderRadius:"var(--r-sm)", 
                        color:"var(--text-2)",
                        fontWeight:600,
                        display:"flex",
                        alignItems:"center",
                        gap:"8px",
                        height:"35.2px"
                      }}>
                        <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:statusColors[selectedTicket.status] || "#6b7280" }} />
                        <span>Status: <strong style={{ color:statusColors[selectedTicket.status] }}>{selectedTicket.status}</strong></span>
                      </div>
                    </div>
                    {/* Delete */}
                    <motion.button whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }} onClick={() => deleteTicket(selectedTicket.id)} className="btn-danger btn-sm" style={{ padding:"0.42rem 0.65rem", borderRadius:"var(--r-sm)" }}>
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
