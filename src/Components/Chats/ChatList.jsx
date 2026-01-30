import React, { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import { NavLink } from "react-router-dom";

const ChatList = ({
  chats,
  activeChat,
  setActiveChat,
  setShowAddModal,
  showSidebarDropdown,
  setShowSidebarDropdown,
  setShowChatDropdown,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  /* 🔍 Filter chats */
  const filteredChats = useMemo(() => {
    if (!searchTerm) return chats;
    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, chats]);

  return (
    <div className={`chat-list-section ${activeChat ? "hide-on-mobile" : ""}`}>
      {/* HEADER */}
      <div className="chat-header">
        <h3>
          <span className="special">K</span>Way
        </h3>

        <div className="chat-actions">
          {/* SEARCH */}
          <div className="mini-search-wrapper">
            <FiSearch
              className="action-icon"
              onClick={() => setShowSearch((prev) => !prev)}
            />

            {showSearch && (
              <input
                autoFocus
                className="mini-search-input"
                placeholder="Search users, chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => {
                  if (!searchTerm) setShowSearch(false);
                }}
              />
            )}
          </div>

          {/* MENU */}
          <div className="dropdown-wrapper">
            <BsThreeDotsVertical
              className="action-icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowSidebarDropdown((prev) => !prev);
                setShowChatDropdown(false);
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

      {/* CHAT LIST */}
      <div className="chat-list">
        {filteredChats.length === 0 ? (
          <div className="empty-chat">No chats found</div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${
                activeChat?.id === chat.id ? "active" : ""
              }`}
              onClick={() => setActiveChat(chat)}
            >
              <div className="chat-avatar">
                {chat.avatar ? (
                  <img
                    className="chat-avatar-img"
                    src={chat.avatar}
                    alt=""
                  />
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
          ))
        )}
      </div>

      {/* FLOATING ADD CHAT (WHATSAPP STYLE) */}
      <button
        className="floating-add-btn"
        onClick={() => setShowAddModal(true)}
      >
        <IoMdAdd />
      </button>
    </div>
  );
};

export default ChatList;
