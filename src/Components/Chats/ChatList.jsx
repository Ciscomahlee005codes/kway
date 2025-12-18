import React from "react";
import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import { NavLink } from "react-router-dom";

const ChatList = ({
  chats,
  activeChat,
  setActiveChat,
  showSearch,
  setShowSearch,
  setShowAddModal,
  showSidebarDropdown,
  setShowSidebarDropdown,
  setShowChatDropdown
}) => {
  return (
    <div className={`chat-list-section ${activeChat ? "hide-on-mobile" : ""}`}>
      <div className="chat-header">
        <h3><span className="special">K</span>Way</h3>

        <div className="chat-actions">
          <FiSearch onClick={() => setShowSearch(!showSearch)} />
          <IoMdAdd onClick={() => setShowAddModal(true)} />

          <div className="dropdown-wrapper">
            <BsThreeDotsVertical
              onClick={(e) => {
                e.stopPropagation();
                setShowSidebarDropdown(prev => !prev);
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

      <div className="chat-list">
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`chat-item ${activeChat?.id === chat.id ? "active" : ""}`}
            onClick={() => setActiveChat(chat)}
          >
            <div className="chat-avatar">
              {chat.avatar ? <img className="chat-avatar-img " src={chat.avatar} alt="" /> : chat.name[0]}
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
  );
};

export default ChatList;
