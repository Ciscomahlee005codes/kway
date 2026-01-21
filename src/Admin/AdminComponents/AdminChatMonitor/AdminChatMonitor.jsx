import React, { useState } from "react";
import "./AdminChatMonitor.css";

const AdminChatMonitor = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const chatList = [
    { id: 1, users: ["John Doe", "Admin"], lastMsg: "User: I need help", flagged: false },
    { id: 2, users: ["Sarah", "Support"], lastMsg: "Support: Issue resolved ✔", flagged: true },
    { id: 3, users: ["Emeka", "Admin"], lastMsg: "User: Thank you!", flagged: false },
  ];

  const monitoredMessages = [
    { from: "user", text: "Hello Admin", time: "10:43 AM" },
    { from: "admin", text: "Hi, how may I assist?", time: "10:44 AM" },
    { from: "user", text: "I forgot my password", time: "10:45 AM" },
  ];

  return (
    <div className="admin-monitor-container">
      {/* LEFT PANEL */}
      <div
        className={`admin-monitor-left ${
          selectedChat ? "hide-mobile" : ""
        }`}
      >
        <h3 className="admin-monitor-title">Chat Monitoring</h3>

        <input
          type="text"
          placeholder="Search chats..."
          className="admin-monitor-search"
        />

        <div className="admin-monitor-chatlist">
          {chatList.map((chat) => (
            <div
              key={chat.id}
              className={`admin-monitor-chatitem ${
                selectedChat === chat.id ? "active" : ""
              }`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <div className="admin-monitor-chat-users">
                <strong>{chat.users[0]}</strong> ↔ {chat.users[1]}
              </div>
              <p className="admin-monitor-lastmsg">{chat.lastMsg}</p>

              {chat.flagged && (
                <span className="admin-monitor-flag">⚠ Flagged</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className={`admin-monitor-right ${
          selectedChat ? "show-mobile" : ""
        }`}
      >
        {selectedChat ? (
          <>
            <div className="admin-monitor-header">
              <button
                className="admin-monitor-back"
                onClick={() => setSelectedChat(null)}
              >
                ← Back
              </button>

              <h4>
                {chatList
                  .find((c) => c.id === selectedChat)
                  ?.users.join(" & ")}
              </h4>
            </div>

            <div className="admin-monitor-messages">
              {monitoredMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`admin-monitor-message ${
                    msg.from === "admin"
                      ? "admin-monitor-adminmsg"
                      : "admin-monitor-usermsg"
                  }`}
                >
                  <p>{msg.text}</p>
                  <small>{msg.time}</small>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="admin-monitor-empty">
            <p>Select a chat to monitor</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatMonitor;
