import React, { useEffect, useState } from "react";
import "./AdminNotification.css";
import { supabase } from "../../../supabase";

const AdminNotification = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  // ================= FETCH NOTIFICATIONS =================
  const fetchNotifications = async () => {
    // NEW USERS
    const { data: users } = await supabase
      .from("profiles")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // NEW STATUS POSTS
    const { data: statuses } = await supabase
      .from("status")
      .select(`
        id,
        content,
        created_at,
        profiles(name)
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    let combined = [];

    users?.forEach((user) => {
      combined.push({
        id: "user-" + user.id,
        text: `🟢 New user registered: ${user.name}`,
        time: user.created_at,
      });
    });

    statuses?.forEach((status) => {
      combined.push({
        id: "status-" + status.id,
        text: `📢 ${status.profiles?.name} posted a new status`,
        time: status.created_at,
      });
    });

    // SORT ALL TOGETHER
    combined.sort(
      (a, b) => new Date(b.time) - new Date(a.time)
    );

    setNotifications(combined);
  };

  // ================= PUBLISH ANNOUNCEMENT =================
  const publishAnnouncement = () => {
    if (!title || !message) return;

    const newAnnounce = {
      id: Date.now(),
      title,
      msg: message,
    };

    setAnnouncements([newAnnounce, ...announcements]);
    setTitle("");
    setMessage("");
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ================= SEARCH FILTER =================
  const filteredNotifications = notifications.filter((n) =>
    n.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-notify-container">
      <h2>Admin Notifications</h2>

      {/* SEARCH */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABS */}
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
          Announcements
        </button>
      </div>

      <div className="admin-notify-content">
        {activeTab === "notifications" && (
          <div className="notify-list">
            {filteredNotifications.length ? (
              filteredNotifications.map((n) => (
                <div key={n.id} className="notify-item">
                  <p>{n.text}</p>
                  <span>
                    {new Date(n.time).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p>No notifications found.</p>
            )}
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="announce-section">
            {announcements.map((a) => (
              <div key={a.id} className="announce-item">
                <strong>{a.title}</strong>
                <p>{a.msg}</p>
              </div>
            ))}

            <div className="announce-form">
              <h4>Publish Announcement</h4>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Write announcement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={publishAnnouncement}>
                Publish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotification;