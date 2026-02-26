import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import "./KwayChatStats.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const KwayChatStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    chats: 0,
    status: 0,
    activeToday: 0,
  });

  const [chartData, setChartData] = useState([]);

  // ================= FETCH STATS =================
  const fetchStats = async () => {
    // TOTAL USERS
    const { count: users } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // TOTAL CHATS
    const { count: chats } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true });

    // TOTAL STATUS
    const { count: status } = await supabase
      .from("status")
      .select("*", { count: "exact", head: true });

    // ACTIVE TODAY
    const today = new Date().toISOString().split("T")[0];

    const { count: activeToday } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today);

    setStats({
      users: users || 0,
      chats: chats || 0,
      status: status || 0,
      activeToday: activeToday || 0,
    });
  };

  // ================= FETCH CHART =================
  const fetchChart = async () => {
    const { data } = await supabase
      .from("messages")
      .select("created_at");

    if (!data) return;

    const map = {};

    data.forEach((msg) => {
      const day = msg.created_at.split("T")[0];
      map[day] = (map[day] || 0) + 1;
    });

    const formatted = Object.keys(map).map((day) => ({
      day,
      messages: map[day],
    }));

    setChartData(formatted);
  };

  useEffect(() => {
    fetchStats();
    fetchChart();
  }, []);

  return (
    <div className="kway-stats">
      <h2>Kway Chat Dashboard</h2>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.users}</h3>
          <p>Total Users</p>
        </div>

        <div className="stat-card">
          <h3>{stats.chats}</h3>
          <p>Total Chats</p>
        </div>

        <div className="stat-card">
          <h3>{stats.status}</h3>
          <p>Status Posts</p>
        </div>

        <div className="stat-card">
          <h3>{stats.activeToday}</h3>
          <p>Messages Today</p>
        </div>
      </div>

      {/* CHART */}
      <div className="chart-box">
        <h3>Messages Per Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="messages" stroke="#16a34a" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default KwayChatStats;