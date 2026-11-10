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
import { useLanguage } from "../../Context/LanguageContext";

const ChatList = ({
  typingMap = {},
  chats = [],
  activeChat,
  setChats,
  setActiveChat,
  setShowAddModal,
  showSidebarDropdown,
  setShowSidebarDropdown,
  setShowChatDropdown,
  onlineUsers = [],
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
  const { t } = useLanguage();

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
                placeholder={t("searchUsersChats")}
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
                <NavLink to="/settings/help">{t("helpSupport")}</NavLink>
                <NavLink to="/settings">{t("navSettings")}</NavLink>
                <NavLink to="/profile">{t("navProfile")}</NavLink>
                <NavLink to="/saved">{t("starredMessages")}</NavLink>
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
        {t("welcomeTo")} <span>Kway</span>
      </h3>

      <p>
        {t("noChatsYet")}
      </p>

      <div className="empty-actions">
        <NavLink to="/linkup">
          <button>  🔍 {t("findPeople")} </button>
        </NavLink>

        <NavLink to="/profile">
          <button>👤 {t("setupProfile")}</button>
        </NavLink>
      </div>

      <small>
        {t("privateMessagesSecure")} 🔒
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
       onClick={async () => {
        if (chat.isAI) {
    setActiveChat({
      ...chat,
      messages: chat.messages || []
    });
    return;
  }

await supabase
  .from("messages")
  .update({ seen: true })
  .eq("sender_id", chat.id)
  .eq("receiver_id", user.id)
  .eq("seen", false);

setChats(prev =>
  prev.map(c =>
    c.id === chat.id
      ? { ...c, unread: 0 }
      : c
  )
);

setActiveChat({
  ...chat,
  messages: chat.messages || []
});
}}
      >
        <div className="chat-avatar">
  {chat?.avatar ? (
    <img className="chat-avatar-img" src={chat.avatar} alt="" />
  ) : (
    chat?.name?.[0] || "?"
  )}
  {!chat.isAI && onlineUsers.includes(chat.id) && (
    <span className="chat-list-online-dot" />
  )}
</div>

        <div className="chat-info">
  <h4>{chat?.name || t("unknownUser")}</h4>
  {typingMap[chat.id] ? (
    <p className="chatlist-typing">
      <span className="chatlist-typing-dot" />
      <span className="chatlist-typing-dot" />
      <span className="chatlist-typing-dot" />
      {t("typing")}
    </p>
  ) : (
    <p>
      {chat?.lastMessageType === "image"
        ? `📷 ${t("photo")}`
        : chat?.lastMessageType === "video"
        ? `🎬 ${t("video")}`
        : chat?.lastMessageType === "audio"
        ? `🎤 ${t("voiceMessage")}`
        : chat?.lastMessageType === "status_reply"
        ? `↩️ ${t("repliedToStatus")}`
        : chat?.lastMessage
        ? chat.lastMessage.slice(0, 30)
        : t("noMessagesYet")}
    </p>
  )}
</div>
        <div className="chat-meta">
  <span className="chat-time">
    {chat?.time || ""}
    {!chat.isAI && chat.lastMessageSenderId === user?.id && (
      <span className={`chat-list-tick ${chat.lastMessageSeen ? "seen" : ""}`}>
        {chat.lastMessageSeen ? "✔✔" : "✔"}
      </span>
    )}
  </span>

  {chat.unread > 0 && (
    <span className="unread-badge">{chat.unread}</span>
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
