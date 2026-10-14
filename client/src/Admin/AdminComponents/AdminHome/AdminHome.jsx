import React, { useEffect, useState } from "react";
import { FaArrowUp, FaComments, FaLayerGroup, FaUsers, FaRegClock } from "react-icons/fa";
import "./AdminHome.css";
import { supabase } from "../../../supabase";

const AdminHome = () => {
  const [stats, setStats] = useState({
    users: 0,
    totalMessages: 0,
    activeGroups: 0,
    statusPosts: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      // 🚀 Run all queries in parallel
      const [
        usersRes,
        messagesRes,
        statusRes,
        groupsRes,
        chatsFallbackRes,
        recentUsersRes
      ] = await Promise.all([

        // USERS
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true }),

        // TOTAL MESSAGES
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true }),

        // STATUS POSTS
        supabase
          .from("status")
          .select("*", { count: "exact", head: true }),

        // ✅ PRIMARY: GROUPS TABLE (if exists)
        supabase
          .from("groups")
          .select("*", { count: "exact", head: true }),

        // ⚠️ FALLBACK: CHATS TABLE (if groups table doesn't exist)
        supabase
          .from("chats")
          .select("*", { count: "exact", head: true })
          .eq("type", "group"),

        // RECENT USERS
        supabase
          .from("profiles")
          .select("name, created_at")
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      // 🧠 Smart group count logic
      const activeGroups =
        groupsRes.count ?? chatsFallbackRes.count ?? 0;

      setStats({
        users: usersRes.count || 0,
        totalMessages: messagesRes.count || 0,
        activeGroups: activeGroups,
        statusPosts: statusRes.count || 0,
      });

      setRecentUsers(recentUsersRes.data || []);

    } catch (err) {
      console.error("Dashboard Error:", err);
    }
  };

  const statCards = [
    { label: "Total users", value: stats.users, icon: FaUsers, tone: "green", note: "Registered accounts" },
    { label: "Active groups", value: stats.activeGroups, icon: FaLayerGroup, tone: "blue", note: "Community spaces" },
    { label: "Status posts", value: stats.statusPosts, icon: FaArrowUp, tone: "orange", note: "Shared this month" },
    { label: "Total messages", value: stats.totalMessages, icon: FaComments, tone: "purple", note: "Across all conversations" },
  ];

  const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="admin-home">
      <div className="admin-header">
        <div>
          <span className="eyebrow">Workspace overview</span>
          <h1>Good morning, Admin.</h1>
          <p>Here is what is happening across your Kway community today.</p>
        </div>
        <div className="admin-header-right">
          <span className="status-indicator" />
          <div>
            <strong>All systems operational</strong>
            <span>Updated just now</span>
          </div>
        </div>
      </div>

      <div className="admin-stats">
        {statCards.map(({ label, value, icon: Icon, tone, note }) => (
          <div className={`admin-card ${tone}`} key={label}>
            <div className="card-topline">
              <span className="stat-icon"><Icon /></span>
              <span className="stat-trend"><FaArrowUp /> Live</span>
            </div>
            <p className="admin-label">{label}</p>
            <p className="admin-number">{value.toLocaleString()}</p>
            <span className="admin-card-note">{note}</span>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">Activity feed</span>
            <h2>Recent users</h2>
          </div>
          <span className="section-count">{recentUsers.length} latest</span>
        </div>

        <div className="activity-list">
          {recentUsers.length > 0 ? recentUsers.map((user, i) => (
            <div key={`${user.created_at}-${i}`} className="activity-item">
              <span className="avatar">{(user.name || "U").charAt(0).toUpperCase()}</span>
              <div className="activity-content">
                <p><strong>{user.name || "New user"}</strong> joined Kway</p>
                <span className="time"><FaRegClock /> {formatDate(user.created_at)}</span>
              </div>
              <span className="activity-status">New</span>
            </div>
          )) : <div className="empty-state">No recent users to display yet.</div>}
        </div>
        </section>

        <aside className="admin-summary">
          <div className="summary-orbit"><span>KW</span></div>
          <span className="section-kicker">Kway pulse</span>
          <h2>Your community at a glance.</h2>
          <p>Keep an eye on the people, conversations, and spaces that make Kway feel alive.</p>
          <div className="summary-divider" />
          <div className="summary-footer"><span className="summary-dot" /> Live data from Supabase</div>
        </aside>
      </div>

    </div>
  );
};

export default AdminHome;