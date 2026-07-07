import React, { useEffect, useState } from "react";
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
          <h3>Active Groups</h3>
          <p className="admin-number">{stats.activeGroups}</p>
        </div>

        <div className="admin-card">
          <h3>Status Posts</h3>
          <p className="admin-number">{stats.statusPosts}</p>
        </div>

        <div className="admin-card">
          <h3>Total Messages</h3>
          <p className="admin-number">{stats.totalMessages}</p>
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