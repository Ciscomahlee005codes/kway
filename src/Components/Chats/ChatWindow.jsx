import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FiMic, FiPhone, FiVideo, FiSend, FiSmile } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef } from "react";


const ChatWindow = ({
  activeChat,
  setActiveChat,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleVoiceClick,
  recording,
  showChatDropdown,
  setShowChatDropdown,
  setShowSidebarDropdown,
  setShowCallModal,
  setCallType,
  reactionPicker,
  setReactionPicker,
  reactions,
  handleReactionClick
}) => {
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
  const emojiRef = useRef(null);
  const dropdownRef = useRef(null);

useEffect(() => {
  // Close dropdown when chat changes
  setShowChatDropdown(false);
}, [activeChat]);



useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target)
    ) {
      setShowChatDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  if (!activeChat) {
    return (
      <div className="chat-window">
        <div className="empty-chat">👈 Select a chat</div>
      </div>
    );
  }

  

  return (
    <div className="chat-window active">
      {/* ================= HEADER ================= */}
      <div className="chat-window-header">
        <IoArrowBack
          className="arrowback-btn"
          onClick={() => setActiveChat(null)}
        />

        <div
          className="chat-header-left"
          onClick={() => navigate("/user-profile", { state: activeChat })}
        >
          <img
            src={activeChat.avatar}
            alt={activeChat.name}
            className="chat-header-avatar"
          />
          <h3>{activeChat.name}</h3>
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

          <div style={{ position: "relative" }} ref={dropdownRef}>
            <BsThreeDotsVertical
              onClick={(e) => {
                e.stopPropagation();
                setShowChatDropdown(prev => !prev);
                setShowSidebarDropdown(false);
              }}
            />

            {showChatDropdown && (
              <div className="chat-dropdown-menu animated-dropdown">
                <p onClick={() => navigate("/user-profile", { state: activeChat })}>View contact</p>
                <p>Search</p>
                <p>Mute notifications</p>
                <p className="danger">Block</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="chat-messages">
        {activeChat.messages.map((msg, i) => (
          <div
  key={i}
  className={`message-wrapper ${msg.sender === "you" ? "sent" : "received"}`}
>
  <div
    className="message-bubble"
    onContextMenu={(e) => {
      e.preventDefault();
      setReactionPicker({ open: true, msgIndex: i });
    }}
    onTouchStart={() => {
      const timer = setTimeout(() => {
        setReactionPicker({ open: true, msgIndex: i });
      }, 500);
      setPressTimer(timer);
    }}
    onTouchEnd={() => clearTimeout(pressTimer)}
  >
    {msg.replyTo && (
      <div className="reply-preview">
        <span>Replying to</span>
        <p>{msg.replyTo}</p>
      </div>
    )}

    <p className="message-text">{msg.text}</p>

    <div className="message-meta">
      <span className="time">{msg.time || "12:45"}</span>

      {msg.sender === "you" && (
        <span className={`status ${msg.status}`}>
          {msg.status === "sent" && "✔"}
          {msg.status === "delivered" && "✔✔"}
          {msg.status === "seen" && <span className="seen">✔✔</span>}
        </span>
      )}
    </div>

    {msg.reaction && (
      <span className="message-reaction">{msg.reaction}</span>
    )}
  </div>
</div>

        ))}
      </div>

      {/* ================= INPUT ================= */}
      <div className="chat-input-wrapper">
        <div className="chat-input-box">
          <FiSmile
            className="emoji-btn"
            onClick={() => setShowEmojiPicker(prev => !prev)}
          />

          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
        </div>

        <FiSend className="chat-send-icon" onClick={handleSendMessage} />

        <div
  className={`chat-voice-btn ${
    recording ? "chat-voice-recording" : ""
  }`}
  onClick={handleVoiceClick}
>
  <FiMic />

  {recording && (
    <div className="voice-wave">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}></span>
      ))}
    </div>
  )}
</div>

        <div className="voice-note">
  <div className="waveform">
    {Array.from({ length: 20 }).map((_, i) => (
      <span key={i}></span>
    ))}
  </div>
  <span className="duration">0:12</span>
</div>

      </div>

      {/* ================= EMOJI PICKER ================= */}
      {showEmojiPicker && (
  <div className="emoji-picker-wrapper" ref={emojiRef}>
    <button
      className="emoji-close-btn"
      onClick={() => setShowEmojiPicker(false)}
    >
      ✕
    </button>

    <EmojiPicker
      onEmojiClick={(emoji) =>
        setNewMessage((prev) => prev + emoji.emoji)
      }
      theme="auto"
    />
  </div>
)}


      {/* ================= REACTIONS ================= */}
       {reactionPicker.open && (
  <>
    {/* Overlay to close */}
    <div
      className="reaction-overlay"
      onClick={() => setReactionPicker({ open: false })}
    />

    <div className="reaction-picker pop">
      <button
        className="reaction-close"
        onClick={() => setReactionPicker({ open: false })}
      >
        ✕
      </button>

      {reactions.map((emoji, i) => (
        <span
          key={i}
          onClick={() => {
            handleReactionClick(emoji, reactionPicker.msgIndex);
            setReactionPicker({ open: false });
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  </>
)}

    </div>
  );
};

export default ChatWindow;
