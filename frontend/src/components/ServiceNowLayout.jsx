import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, PlusCircle, TicketIcon, User as UserIcon, ShieldCheck,
  Menu, X, Bell, Moon, Sun, LogOut, Search, ChevronRight, Zap, FolderOpen,
  Filter, HelpCircle, HardDrive, List
} from "lucide-react";
import api from "../services/api";
import socket from "../services/socket";

export default function ServiceNowLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuFilter, setMenuFilter] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync notifications with backend and socket events
  useEffect(() => {
    if (user) {
      api.get("/notifications")
        .then(res => setNotifications(res.data))
        .catch(() => {});
      
      const handleNotification = (data) => {
        setNotifications(prev => [{ id: Date.now(), ...data, is_read: false }, ...prev]);
      };

      socket.on(`notification:${user.id}`, handleNotification);
      return () => {
        socket.off(`notification:${user.id}`, handleNotification);
      };
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ServiceNow dynamic breadcrumbs mapper
  const getBreadcrumbs = () => {
    const paths = {
      "/": ["Service Portal", "Home"],
      "/dashboard": ["Self-Service", "Dashboard"],
      "/raise-ticket": ["Self-Service", "Raise a Ticket"],
      "/my-tickets": ["Self-Service", "My Requests"],
      "/profile": ["Self-Service", "My Profile"],
      "/admin": ["Service Desk", "Control Center"],
    };
    return paths[location.pathname] || ["Self-Service", "Incident Desk"];
  };

  const breadcrumbs = getBreadcrumbs();

  // ServiceNow Sidebar Navigator items
  const menuSections = [
    {
      title: "Self-Service",
      items: [
        { to: "/", label: "Service Portal Home", icon: <FolderOpen size={13} /> },
        { to: "/dashboard", label: "Overview Dashboard", icon: <LayoutDashboard size={13} /> },
        { to: "/raise-ticket", label: "Create New Request", icon: <PlusCircle size={13} /> },
        { to: "/my-tickets", label: "My Incidents Feed", icon: <TicketIcon size={13} /> },
        { to: "/profile", label: "My Employee Profile", icon: <UserIcon size={13} /> },
      ]
    },
    ...(user?.role === "admin" ? [
      {
        title: "ITIL Service Desk",
        items: [
          { to: "/admin", label: "Admin Control Center", icon: <ShieldCheck size={13} /> }
        ]
      }
    ] : [])
  ];

  // Dynamic filter navigator logic
  const filteredSections = menuSections.map(sec => {
    const matchedItems = sec.items.filter(item =>
      item.label.toLowerCase().includes(menuFilter.toLowerCase())
    );
    return { ...sec, items: matchedItems };
  }).filter(sec => sec.items.length > 0);

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text-1)", transition: "background 0.3s ease" }}>
      
      {/* ── ServiceNow Collapsible Left Sidebar Navigator ── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        style={{
          width: 240,
          background: "var(--bg-2)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 90,
          overflow: "hidden"
        }}
        className="hidden md:flex"
      >
        {/* Left top branding */}
        <div style={{ height: "62px", padding: "0 1.25rem", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "var(--grad-main)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={14} color="#fff" fill="#fff" />
          </div>
          {!sidebarCollapsed && (
            <span style={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.02em", color: "var(--text-1)" }}>
              ServiceNow <span style={{ color: "var(--p3)" }}>ITSM</span>
            </span>
          )}
        </div>

        {/* Filter Navigator Input Box */}
        {!sidebarCollapsed ? (
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.03)", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="input"
                placeholder="Filter navigator..."
                value={menuFilter}
                onChange={e => setMenuFilter(e.target.value)}
                style={{ fontSize: "0.75rem", padding: "0.35rem 0.5rem 0.35rem 1.75rem", background: "rgba(0,0,0,0.15)", borderRadius: "4px" }}
              />
              <Filter size={11} style={{ position: "absolute", left: "0.55rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            </div>
          </div>
        ) : (
          <div style={{ height: "42px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(255,255,255,0.03)", flexShrink: 0 }}>
            <Filter size={12} style={{ color: "var(--text-3)" }} />
          </div>
        )}

        {/* Navigation list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem 0" }}>
          {filteredSections.map((sec, sidx) => (
            <div key={sidx} style={{ marginBottom: "1.25rem" }}>
              {/* Section title */}
              {!sidebarCollapsed ? (
                <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 1.25rem 0.35rem" }}>
                  {sec.title}
                </p>
              ) : (
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", margin: "0.25rem 0.75rem" }} />
              )}

              {/* Section items */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {sec.items.map(item => {
                  const active = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: sidebarCollapsed ? "0" : "10px",
                        justifyContent: sidebarCollapsed ? "center" : "flex-start",
                        padding: "0.5rem 1.25rem",
                        color: active ? "var(--p3)" : "var(--text-2)",
                        textDecoration: "none",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        borderLeft: `2.5px solid ${active ? "var(--p3)" : "transparent"}`,
                        background: active ? "rgba(3,105,161,0.06)" : "transparent",
                        transition: "all 0.18s"
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          e.currentTarget.style.color = "var(--text-1)";
                          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          e.currentTarget.style.color = "var(--text-2)";
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {item.icon}
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredSections.length === 0 && (
            <p style={{ fontSize: "0.75rem", color: "var(--text-3)", padding: "0 1.25rem", fontStyle: "italic" }}>No modules match</p>
          )}
        </div>
      </motion.aside>

      {/* ── Main Canvas Area (Top Banner Frame + Viewport) ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: sidebarCollapsed ? 64 : 240, transition: "margin-left 0.25s ease" }} className="md:ml-sn">
        
        {/* Top Header Banner Frame */}
        <header
          style={{
            height: "62px",
            position: "fixed",
            top: 0,
            right: 0,
            left: sidebarCollapsed ? 64 : 240,
            zIndex: 80,
            background: "rgba(6, 8, 15, 0.75)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1.5rem",
            transition: "left 0.25s ease"
          }}
          className="sn-header"
        >
          {/* Left: Collapse Toggle + Breadcrumbs */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{ background: "none", border: "none", color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center" }}
              title={sidebarCollapsed ? "Expand Navigator" : "Collapse Navigator"}
            >
              <Menu size={18} />
            </button>

            {/* ServiceNow Breadcrumbs frame */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-2)" }} className="hidden sm:flex">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight size={12} style={{ color: "var(--text-3)" }} />}
                  <span style={{ color: idx === breadcrumbs.length - 1 ? "var(--text-1)" : "var(--text-3)" }}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            
            {/* Global Search Box (ServiceNow layout) */}
            <div style={{ position: "relative" }} className="hidden lg:block">
              <input
                type="text"
                placeholder="Global search..."
                className="input"
                style={{ fontSize: "0.75rem", padding: "0.35rem 0.5rem 0.35rem 1.75rem", width: "160px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }}
              />
              <Search size={11} style={{ position: "absolute", left: "0.55rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            </div>

            {/* Theme selector */}
            <button onClick={toggleTheme} className="btn-icon" style={{ color: "var(--text-2)" }}>
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowNotifications(!showNotifications)} className="btn-icon" style={{ color: "var(--text-2)", position: "relative" }}>
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, background: "#f87171", borderRadius: "50%", border: "2px solid var(--bg)" }} />
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: "absolute", top: "100%", right: 0, width: "300px",
                      background: "rgba(10,12,22,0.95)", border: "1px solid rgba(99,102,241,0.2)",
                      borderRadius: "var(--r-md)", padding: "1rem", marginTop: "0.5rem",
                      backdropFilter: "blur(16px)", zIndex: 50, maxHeight: "400px", overflowY: "auto"
                    }}
                  >
                    <h4 style={{ fontSize: "0.9rem", marginBottom: "1rem", color: "var(--text-1)" }}>Incident Alerts</h4>
                    {notifications.length === 0 ? <p style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>No notifications</p> : null}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markRead(n.id)}
                          style={{ 
                            padding: "0.75rem", borderRadius: "6px", cursor: "pointer",
                            background: n.is_read ? "transparent" : "rgba(99,102,241,0.1)",
                            border: `1px solid ${n.is_read ? "transparent" : "rgba(99,102,241,0.2)"}`
                          }}
                        >
                          <p style={{ fontSize: "0.8rem", color: n.is_read ? "var(--text-2)" : "var(--text-1)", margin: 0 }}>{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "10px", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
              <div
                style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "var(--grad-main)", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: "0.7rem", fontWeight: 800,
                  boxShadow: "0 2px 10px rgba(3,105,161,0.4)"
                }}
              >
                {initials}
              </div>
              <span className="hidden lg:block" style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--text-2)" }}>
                {user?.full_name?.split(" ")[0]}
              </span>
            </div>

            {/* Log out */}
            <button onClick={handleLogout} className="btn-icon" title="Logout" style={{ color: "var(--text-2)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = "transparent"; }}
            >
              <LogOut size={15} />
            </button>

          </div>
        </header>

        {/* Viewport Frame */}
        <main style={{ flex: 1, paddingTop: "86px", paddingBottom: "2rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
          {children}
        </main>
      </div>

      {/* CSS adjustments block helper */}
      <style>{`
        @media (max-width: 767px) {
          .md\\:ml-sn { margin-left: 0 !important; }
          .sn-header { left: 0 !important; }
        }
      `}</style>

    </div>
  );
}
