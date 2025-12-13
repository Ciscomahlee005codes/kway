import React, { useState } from "react";
import "./Chats.css";
import CallModal from "./CallModal";
import { FiSearch, FiMic, FiPhone, FiVideo } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { FiSend } from "react-icons/fi";
import { NavLink } from 'react-router-dom';
import ChatImg1 from "../../assets/chatImg-1.jpg"
import ChatImg2 from "../../assets/chatImg-2.jpg"
import ChatImg3 from "../../assets/chatImg-3.jpg"
import ChatImg4 from "../../assets/chatImg-4.jpg"
import { useNavigate } from "react-router-dom";


const initialChats = [
  { 
    id: 1, 
    name: "John Doe", 
    avatar: ChatImg1,
    lastMessage: "Hey, how are you?", 
    time: "10:30 AM", 
    active: true, 
    messages: [] 
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    avatar: ChatImg2,
    lastMessage: "Meeting at 5?", 
    time: "09:45 AM", 
    active: false, 
    messages: [] 
  },
  { 
    id: 3, 
    name: "Dev Group", 
    lastMessage: "Push your code pls 🚀", 
    time: "Yesterday", 
    active: true, 
    messages: [] 
  },
  { 
    id: 4, 
    name: "Samuel", 
    avatar: ChatImg4,
    lastMessage: "Check this out!", 
    time: "Monday", 
    active: false, 
    messages: [] 
  },

  // These ones will remain WITHOUT images
  { 
    id: 5, 
    name: "Tochukwu", 
     avatar: ChatImg3,
    lastMessage: "Afa Kosi", 
    time: "Monday", 
    active: false, 
    messages: [] 
  },
  { 
    id: 6, 
    name: "Chekwube", 
    lastMessage: "I've Sent it", 
    time: "Monday", 
    active: false, 
    messages: [] 
  },
  { 
    id: 7, 
    name: "My Mummy", 
    lastMessage: "Asa Nwam", 
    time: "Yesterday", 
    active: false, 
    messages: [] 
  },
];


const Chats = () => {
  const [chats, setChats] = useState(initialChats);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", lastMessage: "", phone: "" });
  const [showSidebarDropdown, setShowSidebarDropdown] = useState(false);
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const navigate = useNavigate();
const [callType, setCallType] = useState("voice");
const [reactionPicker, setReactionPicker] = useState({ open: false, msgIndex: null, x: 0, y: 0 });
const reactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"]; // you can customize



  const handleVoiceClick = () => {
    setRecording(true);
    setTimeout(() => setRecording(false), 3000);
  };

  const handleSendMessage = () => {
  if (!newMessage.trim()) return;
  const updatedChats = chats.map((chat) => {
    if (chat.id === activeChat.id) {
      const updatedMessages = [
        ...(chat.messages || []),
        { sender: "you", text: newMessage, time: "Now", reaction: null }, // ✅ add reaction
      ];
      return { ...chat, messages: updatedMessages, lastMessage: newMessage, time: "Now" };
    }
    return chat;
  });
  setChats(updatedChats);
  setActiveChat({
    ...activeChat,
    messages: [...(activeChat.messages || []), { sender: "you", text: newMessage, time: "Now", reaction: null }],
  });
  setNewMessage("");
};
  const handleReactionClick = (emoji, index) => {
  const updatedMessages = [...activeChat.messages];
  updatedMessages[index].reaction = emoji;

  setActiveChat({ ...activeChat, messages: updatedMessages });

  const updatedChats = chats.map(chat =>
    chat.id === activeChat.id ? { ...chat, messages: updatedMessages } : chat
  );

  setChats(updatedChats);
  setReactionPicker({ open: false, msgIndex: null, x: 0, y: 0 });
};

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContact.name) return;
    const newChat = {
      id: chats.length + 1,
      name: newContact.name,
      lastMessage: newContact.lastMessage || "New contact added",
      time: "Now",
      active: true,
      messages: [],
    };
    setChats([...chats, newChat]);
    setShowAddModal(false);
    setNewContact({ name: "", lastMessage: "", phone: "" });
  };

  return (
    <div className="chat-wrapper" onClick={() => {
    setShowSidebarDropdown(false);
    setShowChatDropdown(false);
  }}>
      {/* LEFT SECTION */}
      <div className={`chat-list-section ${activeChat ? "hide-on-mobile" : ""}`}>
        <div className="chat-header">
          <div className="chat-logo">
            <h3><span className="special">K</span>Way</h3>
          </div>

          <div className="chat-actions">
            <div className="mini-search-wrapper">
              <FiSearch
                className="search-icon"
                title="Search Messages"
                onClick={() => setShowSearch(!showSearch)}
              />
              {showSearch && (
                <input
                  type="text"
                  className="mini-search-input"
                  placeholder="Search messages..."
                />
              )}
            </div>

            <IoMdAdd
              className="new-chat-icon"
              title="Add New Contact"
              onClick={() => setShowAddModal(true)}
            />

            <div className="dropdown-wrapper">
              <BsThreeDotsVertical
  className="menu-icon"
  onClick={(e) => {
    e.stopPropagation();
    setShowSidebarDropdown(prev => !prev);
    setShowChatDropdown(false); // close other menu
  }}
/>

{showSidebarDropdown && (
  <div className="dropdown-menu animated-dropdown">
    <NavLink to="/settings/help">Help & Support</NavLink>
    <NavLink to="/settings">Settings</NavLink>
    <NavLink to="/profile">Profile</NavLink>
    <NavLink to="/saved">Saved Messages</NavLink>
  </div>
)}

            </div>
          </div>
        </div>

        <div className="chat-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${activeChat?.id === chat.id ? "active" : ""}`}
              onClick={() => setActiveChat(chat)}
            >
              <div className="chat-avatar">
  {chat.avatar ? (
    <img src={chat.avatar} alt={chat.name} className="chat-avatar-img" />
  ) : (
    chat.name[0]
  )}
</div>

              <div className="chat-info">
                <h4>{chat.name}</h4>
                <p>{chat.lastMessage}</p>
              </div>
              <span className="chat-time">{chat.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className={`chat-window ${activeChat ? "active" : ""}`}>
        {activeChat ? (
          <div className="chat-window-content">
            <div className="chat-window-header">
              <IoArrowBack className="back-btn" onClick={() => setActiveChat(null)} />
              <div className="chat-header-left">
  <img
    src={activeChat.avatar || "https://api.dicebear.com/7.x/thumbs/svg?seed=user"}
    alt={activeChat.name}
    className="chat-header-avatar"
    onClick={() => navigate("/user-profile", { state: activeChat })}
  />

  <div className="user-name-section">
    <h3>{activeChat.name}</h3>
    <span
      className={`status-dot ${activeChat.active ? "online" : "offline"}`}
    ></span>
  </div>
</div>

      <div className="header-actions">
  <FiPhone
    className="action-icon"
    onClick={() => {
      setCallType("voice");
      setShowCallModal(true);
    }}
  />

  <FiVideo
    className="action-icon"
    onClick={() => {
      setCallType("video");
      setShowCallModal(true);
    }}
  />

  <div className="chat-header-dropdown">
    <BsThreeDotsVertical
  className="action-icon"
  onClick={(e) => {
    e.stopPropagation();
    setShowChatDropdown(prev => !prev);
    setShowSidebarDropdown(false); // close other menu
  }}
/>

{showChatDropdown && (
  <div className="chat-dropdown-menu">
    <p
  onClick={() => {
    navigate("/user-profile", { state: activeChat });
    setShowChatDropdown(false);
  }}
>
  View Profile
</p>

    <p>Mute Notifications</p>
    <p>Clear Chat</p>
    <p className="danger">Block User</p>
  </div>
)}

  </div>
</div>


            </div>

            <div className="chat-messages">
              {(activeChat.messages || []).map((msg, index) => (
                <div
  key={index}
  className={`message-bubble ${msg.sender === "you" ? "sent" : "received"}`}
  onContextMenu={(e) => { // right click for desktop
    e.preventDefault();
    setReactionPicker({ open: true, msgIndex: index, x: e.clientX, y: e.clientY });
  }}
  onTouchStart={(e) => { // long press for mobile
    const timer = setTimeout(() => {
      const touch = e.touches[0];
      setReactionPicker({ open: true, msgIndex: index, x: touch.clientX, y: touch.clientY });
    }, 600);
    e.target.ontouchend = () => clearTimeout(timer);
  }}
>
  <p>{msg.text}</p>
  {msg.reaction && <span className="message-reaction">{msg.reaction}</span>}
</div>

              ))}
            </div>

            <div className="chat-input-wrapper">
  <div className="chat-input-box">
    <input
      type="text"
      placeholder="Type a message..."
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
    />

    <FiSend 
      className="chat-send-icon"
      onClick={handleSendMessage}
    />
  </div>

  <div
    className={`chat-voice-btn ${recording ? "chat-voice-recording" : ""}`}
    onClick={handleVoiceClick}
    title="Record Voice Note"
  >
    <FiMic />
    {recording && <span className="chat-voice-pulse"></span>}
  </div>
</div>


          </div>
        ) : (
          <div className="empty-chat">👈 Select a chat to start messaging</div>
        )}
      </div>

      {/* ADD CONTACT MODAL */}
      {showAddModal && (
        <div className="add-contact-modal">
          <div className="modal-content">
            <h3>Add New Contact</h3>
            <form onSubmit={handleAddContact}>
              <input
                type="text"
                placeholder="Full Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />
              <input
                type="text"
                placeholder="Last Message (optional)"
                value={newContact.lastMessage}
                onChange={(e) => setNewContact({ ...newContact, lastMessage: e.target.value })}
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showCallModal && (
  <CallModal
    type={callType}
    participant={activeChat}
    onClose={() => setShowCallModal(false)}
  />
)}
{reactionPicker.open && (
  <div
    className="reaction-picker"
    style={{ top: reactionPicker.y + 10, left: reactionPicker.x - 50 }}
  >
    {reactions.map((emoji, i) => (
      <span key={i} onClick={() => handleReactionClick(emoji, reactionPicker.msgIndex)}>
        {emoji}
      </span>
    ))}
  </div>
)}

    </div>
  );
};

export default Chats;