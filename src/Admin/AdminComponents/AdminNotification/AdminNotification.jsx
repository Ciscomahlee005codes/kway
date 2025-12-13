import React, { useState } from "react";
import "./AdminNotification.css";

const AdminNotification = () => {
  const [activeTab, setActiveTab] = useState("notifications");

  // Example Data
  const notifications = [
    { id: 1, text: "New user registered", time: "2 mins ago" },
    { id: 2, text: "System backup completed", time: "1 hour ago" },
    { id: 3, text: "New message reported", time: "Yesterday" },
  ];

  const announcements = [
    { id: 1, title: "System Update", msg: "Version 2.1 rolling out soon." },
    { id: 2, title: "Maintenance", msg: "Server upgrade scheduled Friday." },
  ];

  return (
    <div className="admin-notify-container">
      <h2>Notifications & Updates</h2>

      {/* TAB BUTTONS */}
      <div className="admin-notify-tabs">
        <button
          className={activeTab === "notifications" ? "active" : ""}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>

        <button
          className={activeTab === "announcements" ? "active" : ""}
          onClick={() => setActiveTab("announcements")}
        >
          Announcements & Updates
        </button>
      </div>

      {/* CONTENT */}
      <div className="admin-notify-content">
        {activeTab === "notifications" && (
          <div className="notify-list">
            {notifications.map((n) => (
              <div key={n.id} className="notify-item">
                <p>{n.text}</p>
                <span>{n.time}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="announce-section">
            <h3>All Announcements</h3>

            {announcements.map((a) => (
              <div key={a.id} className="announce-item">
                <strong>{a.title}</strong>
                <p>{a.msg}</p>
              </div>
            ))}

            {/* Publish new announcement */}
            <div className="announce-form">
              <h4>Publish Announcement</h4>
              <input type="text" placeholder="Title" />
              <textarea placeholder="Write announcement..." />
              <button>Publish</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotification;
