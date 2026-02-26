import React, { useEffect, useState } from "react";
import "./AdminChatMonitor.css";
import { supabase } from "../../../supabase";
import Avatar from "../../../assets/avatar.png";

const dummy = Avatar;

const AdminChatMonitor = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});

  // ================= LOAD PROFILES =================
  const loadProfiles = async () => {
    const { data } = await supabase.from("profiles").select("id,name,photo");

    const map = {};
    data?.forEach((p) => (map[p.id] = p));
    setProfiles(map);
  };

  // ================= FETCH CONVERSATIONS =================
  const fetchConversations = async () => {
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, content, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error fetching messages:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.log("No messages found");
    setConversations([]);
    return;
  }

  const conversationMap = {};

  data.forEach((msg) => {
    const key =
      msg.sender_id < msg.receiver_id
        ? `${msg.sender_id}-${msg.receiver_id}`
        : `${msg.receiver_id}-${msg.sender_id}`;

    if (!conversationMap[key]) {
      conversationMap[key] = [];
    }

    conversationMap[key].push(msg);
  });

  const formattedConversations = Object.values(conversationMap).map(
    (msgs) => {
      const sorted = msgs.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      return {
        lastMessage: sorted[0],
        allMessages: sorted,
      };
    }
  );

  setConversations(formattedConversations);
};

  // ================= OPEN CHAT =================
  const openChat = (chat) => {
    setSelectedChat(chat);
    setMessages(
      chat.allMessages.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      )
    );
  };

  useEffect(() => {
    loadProfiles();
    fetchConversations();
  }, []);

  return (
    <div className="monitor-container">

      {/* LEFT PANEL */}
      <div className={`monitor-left ${selectedChat ? "hide-mobile" : ""}`}>

        <div className="left-header">
          <h2>Chat Monitor</h2>
          <p>Moderate Kway conversations</p>
        </div>

        <div className="monitor-stats">
          <div>
            <b>{conversations.length}</b>
            <span>Total Chats</span>
          </div>
        </div>

        <div className="chat-list">
          {conversations.map((chat, i) => {
            const msg = chat.lastMessage;
            const sender = profiles[msg.sender_id];
            const receiver = profiles[msg.receiver_id];

            return (
              <div
                key={i}
                className="chat-item"
                onClick={() => openChat(chat)}
              >
                <img
                  src={sender?.photo || dummy}
                  className="chat-avatar"
                  alt=""
                />

                <div className="chat-info">
                  <h4>
                    {sender?.name || "User"} ↔ {receiver?.name || "User"}
                  </h4>
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={`monitor-right ${selectedChat ? "show-mobile" : ""}`}>
        {selectedChat ? (
          <>
            <div className="monitor-header">
              <button onClick={() => setSelectedChat(null)}>←</button>

              <h3>
                {profiles[selectedChat.lastMessage.sender_id]?.name} &{" "}
                {profiles[selectedChat.lastMessage.receiver_id]?.name}
              </h3>
            </div>

            <div className="messages">
              {messages.map((msg) => {
                const sender = profiles[msg.sender_id];

                return (
                  <div key={msg.id} className="msg">
                    <b>{sender?.name || "User"}:</b>
                    <p>{msg.content}</p>
                    <small>
                      {new Date(msg.created_at).toLocaleString()}
                    </small>
                  </div>
                );
              })}
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