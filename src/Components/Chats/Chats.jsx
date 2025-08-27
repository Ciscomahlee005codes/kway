import React, { useState } from "react";
import "./Chats.css";
import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5"; 
import KwayLogo from "../../assets/kway-logo-1.png"

// Dummy chats
const dummyChats = [
  { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", time: "10:30 AM" },
  { id: 2, name: "Jane Smith", lastMessage: "Meeting at 5?", time: "09:45 AM" },
  { id: 3, name: "Dev Group", lastMessage: "Push your code pls 🚀", time: "Yesterday" },
  { id: 4, name: "Samuel", lastMessage: "Check this out!", time: "Monday" },
];

const Chats = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="chat-wrapper">
      {/* Left Section - Chat List */}
      <div className={`chat-list-section ${activeChat ? "hide-on-mobile" : ""}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-logo">
            <img src={KwayLogo} alt="Logo" />
          </div>
        

          <div className="chat-actions">
            <div className="chat-search">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search..." />
            </div>

            <IoMdAdd className="new-chat-icon" title="New Chat" />

            <div className="dropdown-wrapper">
              <BsThreeDotsVertical
                className="menu-icon"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <p>Profile</p>
                  <p>Archived</p>
                  <p>Settings</p>
                  <p>Logout</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="chat-filters">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Unread</button>
          <button className="filter-btn">Favorite</button>
          <button className="filter-btn">Groups</button>
        </div>

        {/* Chat List */}
        <div className="chat-list">
          {dummyChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${activeChat?.id === chat.id ? "active" : ""}`}
              onClick={() => setActiveChat(chat)}
            >
              <div className="chat-avatar">{chat.name[0]}</div>
              <div className="chat-info">
                <h4>{chat.name}</h4>
                <p>{chat.lastMessage}</p>
              </div>
              <span className="chat-time">{chat.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section - Active Chat */}
      <div className={`chat-window ${activeChat ? "active" : ""}`}>
        {activeChat ? (
          <div className="chat-window-content">
            <div className="chat-window-header">
              {/* Back button visible only on mobile */}
              <IoArrowBack
                className="back-btn"
                onClick={() => setActiveChat(null)}
              />
              <h3>{activeChat.name}</h3>
            </div>
            <div className="chat-messages">
              <p><strong>{activeChat.name}:</strong> {activeChat.lastMessage}</p>
              <p><strong>You:</strong> Sure! 👍</p>
            </div>
            <div className="chat-input">
              <input type="text" placeholder="Type a message..." />
              <button>Send</button>
            </div>
          </div>
        ) : (
          <div className="empty-chat">👈 Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
};

export default Chats;
