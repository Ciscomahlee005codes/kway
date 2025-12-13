import React from "react";
import "./AdminHome.css";

const AdminHome = () => {
  return (
    <div className="adminDash-home">

      {/* Header */}
      <div className="adminDash-header">
        <h1>Dashboard</h1>
        <p>Welcome back, Admin 👋</p>
      </div>

      {/* Stats Cards */}
      <div className="adminDash-stats">
        <div className="adminDash-card">
          <h3>Total Users</h3>
          <p className="adminDash-number">2,350</p>
        </div>

        <div className="adminDash-card">
          <h3>Active Chats</h3>
          <p className="adminDash-number">142</p>
        </div>

        <div className="adminDash-card">
          <h3>Reports</h3>
          <p className="adminDash-number">8</p>
        </div>

        <div className="adminDash-card">
          <h3>Messages Today</h3>
          <p className="adminDash-number">12,440</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="adminDash-section">
        <h2>Recent Activity</h2>

        <div className="adminDash-activity-list">

          <div className="adminDash-activity">
            <span className="dot online"></span>
            <p>User <strong>Chidera</strong> just joined</p>
            <span className="time">2 mins ago</span>
          </div>

          <div className="adminDash-activity">
            <span className="dot chat"></span>
            <p>New group created: <strong>Tech Bros Zone</strong></p>
            <span className="time">10 mins ago</span>
          </div>

          <div className="adminDash-activity">
            <span className="dot alert"></span>
            <p>User <strong>Kelvin</strong> was reported</p>
            <span className="time">35 mins ago</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminHome;
