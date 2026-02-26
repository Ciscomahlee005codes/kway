import React, { useMemo, useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import KwayLogo from "../../assets/kway-logo-1.png";
import { FaSmile } from "react-icons/fa";
import TestimonialModal from "../TestimonialModal/TestimonialModal";
import "../TestimonialModal/TestimonialModal.css";
import { supabase } from "../../supabase";

const ChatList = ({
  chats = [],
  activeChat,
  setActiveChat,
  setShowAddModal,
  showSidebarDropdown,
  setShowSidebarDropdown,
  setShowChatDropdown,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTestimonial, setShowTestimonial] = useState(false);
 const [hideButton, setHideButton] = useState(
  localStorage.getItem("kway_reviewed") === "true"
);

const [user, setUser] = useState(null);

useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user);
  };
  getUser();
}, []);

  const navigate = useNavigate();

  const filteredChats = useMemo(() => {
    if (!searchTerm) return chats;

    return chats.filter((chat) => {
      const name = chat?.name?.toLowerCase() || "";
      const lastMessage = chat?.lastMessage?.toLowerCase() || "";

      return (
        name.includes(searchTerm.toLowerCase()) ||
        lastMessage.includes(searchTerm.toLowerCase())
      );
    });
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
  <div className="empty-chat-mobile">

    <div className="empty-chat-card">

      <div className="empty-icon"><img src={KwayLogo} alt="Kway Logo" className="logo-img" /></div>

      <h3>
        Welcome to <span>Kway</span>
      </h3>

      <p>
        No chats yet. Link up with friends using
        usernames, not just phone numbers.
      </p>

      <div className="empty-actions">
        <NavLink to="/linkup">
          <button>  🔍 Find People </button>
        </NavLink>

        <NavLink to="/profile">
          <button>👤 Setup Profile</button>
        </NavLink>
      </div>

      <small>
        Your messages are private & secure 🔒
      </small>

    </div>

  </div>
) : (

  filteredChats.map((chat) => {
    return (
      <div
        key={chat.id}
        className={`chat-item ${
          activeChat?.id === chat.id ? "active" : ""
        }`}
        onClick={() => setActiveChat(chat)}
      >
        <div className="chat-avatar">
          {chat?.avatar ? (
            <img
              className="chat-avatar-img"
              src={chat.avatar}
              alt=""
            />
          ) : (
            chat?.name?.[0] || "?"
          )}
        </div>

        <div className="chat-info">
          <h4>{chat?.name || "Unknown"}</h4>
          <p>
  {chat?.lastMessage
    ? chat.lastMessage.slice(0, 30)
    : "No messages yet"}
</p>

        </div>
        <div className="chat-meta">
  <span className="chat-time">
    {chat?.time || ""}
  </span>

  {chat.unread > 0 && (
    <span className="unread-badge">
      {chat.unread}
    </span>
  )}
</div>


        
      </div>
    );
  })
)}

      </div>

      {/* FLOATING ADD CHAT */}
      <button
        className="floating-add-btn"
        onClick={() => {
          setShowAddModal(true);
          navigate("/linkup");
        }}
      >
        <IoMdAdd />
      </button>

      {/* FLOATING TESTIMONIAL */}
{!hideButton && (
  <button
    className="floating-testimonial-btn"
    onClick={() => setShowTestimonial(true)}
  >
    <FaSmile />
  </button>
)}

{showTestimonial && user && (
  <TestimonialModal
    user={user}
    onClose={() => setShowTestimonial(false)}
    onSubmitted={() => setHideButton(true)}
  />
)}
    </div>
  );
};

export default ChatList;
