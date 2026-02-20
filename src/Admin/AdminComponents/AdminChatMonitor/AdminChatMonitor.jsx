import React, { useState } from "react";
import "./AdminChatMonitor.css";

const dummy = "https://i.pravatar.cc/100";

const AdminChatMonitor = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [filter, setFilter] = useState("all");

  const chatList = [
    { id: 1, users: ["John Doe", "Admin"], lastMsg: "I need help", flagged: false, active: true },
    { id: 2, users: ["Sarah", "Support"], lastMsg: "Issue resolved ✔", flagged: true, active: false },
    { id: 3, users: ["Emeka", "Admin"], lastMsg: "Thank you!", flagged: false, active: true },
  ];

  const monitoredMessages = [
    { from: "user", text: "Hello Admin", time: "10:43 AM" },
    { from: "admin", text: "Hi, how may I assist?", time: "10:44 AM" },
    { from: "user", text: "I forgot my password", time: "10:45 AM" },
  ];

  const filteredChats = chatList.filter((c) => {
    if (filter === "flagged") return c.flagged;
    if (filter === "active") return c.active;
    return true;
  });

  const currentChat = chatList.find((c) => c.id === selectedChat);

  return (
    <div className="monitor-container">

      {/* LEFT PANEL */}
      <div className={`monitor-left ${selectedChat ? "hide-mobile" : ""}`}>
        <div className="left-header">
          <h2>Chat Monitor</h2>
          <p>Moderate user conversations</p>
        </div>

        {/* Stats */}
        <div className="monitor-stats">
          <div>
            <b>{chatList.length}</b>
            <span>Total</span>
          </div>
          <div>
            <b>{chatList.filter((c) => c.active).length}</b>
            <span>Active</span>
          </div>
          <div>
            <b>{chatList.filter((c) => c.flagged).length}</b>
            <span>Flagged</span>
          </div>
        </div>

        {/* Filter */}
        <div className="monitor-filter">
          {["all", "active", "flagged"].map((type) => (
            <button
              key={type}
              className={filter === type ? "active" : ""}
              onClick={() => setFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Chat List */}
        <div className="chat-list">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat === chat.id ? "active" : ""}`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <img src={dummy} className="chat-avatar" alt="avatar" />

              <div className="chat-info">
                <h4>{chat.users[0]} ↔ {chat.users[1]}</h4>
                <p>{chat.lastMsg}</p>
              </div>

              {chat.flagged && <span className="flag">⚠</span>}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={`monitor-right ${selectedChat ? "show-mobile" : ""}`}>
        {selectedChat ? (
          <>
            <div className="monitor-header">
              <button className="back" onClick={() => setSelectedChat(null)}>←</button>

              <h3>{currentChat?.users.join(" & ")}</h3>

              <div className="actions">
                <button className="mute">Mute</button>
                <button className="warn">Flag</button>
                <button className="danger">Delete</button>
              </div>
            </div>

            <div className="messages">
              {monitoredMessages.map((msg, i) => (
                <div key={i} className={`msg ${msg.from}`}>
                  <p>{msg.text}</p>
                  <small>{msg.time}</small>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty">
            <p>Select a chat to monitor</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatMonitor;
