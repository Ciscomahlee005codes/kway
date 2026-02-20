import React from "react";
import "./AdminHome.css";

const AdminHome = () => {
  return (
    <div className="admin-home">

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>
            <span className="brand-k">K</span>way Dashboard
          </h1>
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
          <p className="admin-number">2,350</p>
        </div>

        <div className="admin-card">
          <h3>Active Chats</h3>
          <p className="admin-number">142</p>
        </div>

        <div className="admin-card">
          <h3>Reports</h3>
          <p className="admin-number danger">8</p>
        </div>

        <div className="admin-card">
          <h3>Messages Today</h3>
          <p className="admin-number">12,440</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <button className="view-all">View All</button>
        </div>

        <div className="activity-list">

          <div className="activity-item">
            <span className="dot online"></span>
            <div className="activity-content">
              <p>User <strong>Chidera</strong> just joined</p>
              <span className="time">2 mins ago</span>
            </div>
          </div>

          <div className="activity-item">
            <span className="dot chat"></span>
            <div className="activity-content">
              <p>New group created: <strong>Tech Bros Zone</strong></p>
              <span className="time">10 mins ago</span>
            </div>
          </div>

          <div className="activity-item">
            <span className="dot alert"></span>
            <div className="activity-content">
              <p>User <strong>Kelvin</strong> was reported</p>
              <span className="time">35 mins ago</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminHome;
