import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoEllipsisVertical } from "react-icons/io5";
import { FiMessageCircle, FiZap, FiCpu } from "react-icons/fi";
import MpA_Img from "../../assets/Mpa_AI2.png";
import "./MpAProfile.css";

const MpAProfile = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="profile-overlay">
      <div className="profile-sheet">

        {/* HEADER */}
        <div className="profile-header">
          <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
          <h3>Mp.A Profile</h3>

          <div className="menu-wrapper" ref={dropdownRef}>
            <IoEllipsisVertical
              className="menu-icon"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div onClick={() => alert("Coming soon 🚀")}>
                  Clear Chat
                </div>
                <div onClick={() => alert("Coming soon 🚀")}>
                  AI Settings
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AVATAR */}
        <div className="profile-avatar-section">
          <div className="ai-avatar-wrapper">
            <img
              src={MpA_Img}
              alt="Mp.A"
              className="profile-avatar2"
            />
            <span className="ai-badge">AI</span>
          </div>

          <h2>Mp.A 🤖</h2>
          <p className="username">@mpa.ai</p>
        </div>

        {/* ACTIONS */}
        <div className="profile-actions">
          <div
            className="action-card"
            onClick={() => navigate("/chats")}
          >
            <FiMessageCircle />
            <span>Chat</span>
          </div>

          <div className="action-card">
            <FiZap />
            <span>Smart Mode</span>
          </div>

          <div className="action-card">
            <FiCpu />
            <span>AI Tools</span>
          </div>
        </div>

        {/* INFO */}
        <div className="profile-info">

          <div className="info-row">
            <p className="label">About</p>
            <p className="value">
              Your intelligent assistant for chatting, ideas, coding, and productivity.
            </p>
          </div>

          <div className="info-row">
            <p className="label">Capabilities</p>
            <p className="value">
              💬 Chat • 🧠 Ideas • 💻 Coding • 📚 Learning • 🚀 Productivity
            </p>
          </div>

          <div className="info-row">
            <p className="label">Quick Prompts</p>
            <div className="prompt-list">
              <span onClick={() => navigate("/chats")}>
                "Help me build an app"
              </span>
              <span onClick={() => navigate("/chats")}>
                "Give me business ideas"
              </span>
              <span onClick={() => navigate("/chats")}>
                "Explain React hooks"
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MpAProfile;