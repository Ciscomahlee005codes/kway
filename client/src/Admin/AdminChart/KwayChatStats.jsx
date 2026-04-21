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
    messages: 0,
    status: 0,
  });

  const [chartData, setChartData] = useState([]);

  // ================= FETCH STATS =================
  const fetchStats = async () => {
    try {
      // TOTAL USERS
      const { count: users } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // TOTAL MESSAGES
      const { count: messages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });

      // TOTAL STATUS
      const { count: status } = await supabase
        .from("status")
        .select("*", { count: "exact", head: true });

      setStats({
        users: users || 0,
        messages: messages || 0,
        status: status || 0,
      });
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  // ================= FETCH CHART =================
  const fetchChart = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("created_at");

    if (error || !data) return;

    const map = {};

    data.forEach((msg) => {
      const day = new Date(msg.created_at).toLocaleDateString();

      map[day] = (map[day] || 0) + 1;
    });

    const formatted = Object.keys(map)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((day) => ({
        day,
        messages: map[day],
      }));

    setChartData(formatted);
  };

  // ================= LIVE REFRESH =================
  useEffect(() => {
    fetchStats();
    fetchChart();

    const interval = setInterval(() => {
      fetchStats();
      fetchChart();
    }, 30000);

    return () => clearInterval(interval);
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

        <div className="stat-card highlight">
          <h3>{stats.messages}</h3>
          <p>Total Messages Sent</p>
        </div>

        <div className="stat-card">
          <h3>{stats.status}</h3>
          <p>Status Posts</p>
        </div>
      </div>

      {/* CHART */}
      <div className="chart-box">
        <h3>Messages Growth Over Time</h3>

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