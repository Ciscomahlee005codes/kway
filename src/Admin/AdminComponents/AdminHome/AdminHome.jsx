import React, { useEffect, useState } from "react";
import "./AdminHome.css";
import { supabase } from "../../../supabase";

const AdminHome = () => {
  const [stats, setStats] = useState({
    users: 0,
    messagesToday: 0,
    activeChats: 0,
    statusPosts: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      // ================= USERS =================
      const { count: users } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // ================= MESSAGES TODAY =================
      const today = new Date().toISOString().split("T")[0];

      const { count: messagesToday } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today);

      // ================= ACTIVE STATUS =================
      const { count: statusPosts } = await supabase
        .from("status")
        .select("*", { count: "exact", head: true });

      // ================= ACTIVE CHATS =================
      const { data: chats } = await supabase
        .from("messages")
        .select("chat_id");

      const uniqueChats = new Set(chats?.map(c => c.chat_id));

      // ================= RECENT USERS =================
      const { data: usersRecent } = await supabase
        .from("profiles")
        .select("name, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        users: users || 0,
        messagesToday: messagesToday || 0,
        activeChats: uniqueChats.size || 0,
        statusPosts: statusPosts || 0,
      });

      setRecentUsers(usersRecent || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="admin-home">

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1><span className="brand-k">K</span>way Dashboard</h1>
          <p>Welcome back, Admin 👋</p>
        </div>
        <div className="admin-header-right">
          <span className="status-indicator"></span>
          <p>System Active</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">

        <div className="admin-card">
          <h3>Total Users</h3>
          <p className="admin-number">{stats.users}</p>
        </div>

        <div className="admin-card">
          <h3>Active Chats</h3>
          <p className="admin-number">{stats.activeChats}</p>
        </div>

        <div className="admin-card">
          <h3>Status Posts</h3>
          <p className="admin-number">{stats.statusPosts}</p>
        </div>

        <div className="admin-card">
          <h3>Messages Today</h3>
          <p className="admin-number">{stats.messagesToday}</p>
        </div>

      </div>

      {/* Recent Users */}
      <div className="admin-section">
        <div className="section-header">
          <h2>Recent Users</h2>
        </div>

        <div className="activity-list">
          {recentUsers.map((user, i) => (
            <div key={i} className="activity-item">
              <span className="dot online"></span>
              <div className="activity-content">
                <p><strong>{user.name}</strong> just joined</p>
                <span className="time">
                  {new Date(user.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminHome;