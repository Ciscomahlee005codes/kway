import React, { useState } from "react";
import { IoArrowBack, IoChevronForward } from "react-icons/io5";
import { FaUserCircle, FaLock, FaBell, FaPaintBrush, FaInfoCircle, FaQuestionCircle, FaLanguage } from "react-icons/fa";
import "./Settings.css";

const Settings = () => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    document.body.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <h2>Settings</h2>
      </div>

      {/* Profile section */}
      <div className="settings-profile">
        <FaUserCircle className="profile-picture" />
        <div className="profile-info">
          <h3>John Doe</h3>
          <p>Hey there! I’m using Kway Chat 😎</p>
        </div>
      </div>

      {/* Settings list */}
      <div className="settings-list">
        <div className="settings-item">
          <FaLock className="item-icon" />
          <div className="item-text">
            <h4>Account</h4>
            <p>Privacy, security, change number</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

        <div className="settings-item">
          <FaBell className="item-icon" />
          <div className="item-text">
            <h4>Notifications</h4>
            <p>Message, group & call tones</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

        <div className="settings-item">
          <FaPaintBrush className="item-icon" />
          <div className="item-text">
            <h4>Appearance</h4>
            <p>Light / Dark mode & colors</p>
          </div>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        <div className="settings-item">
          <FaLanguage className="item-icon" />
          <div className="item-text">
            <h4>Language</h4>
            <p>App language</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

        <div className="settings-item">
          <FaInfoCircle className="item-icon" />
          <div className="item-text">
            <h4>Help</h4>
            <p>FAQ, contact us, privacy policy</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

        <div className="settings-item">
          <FaQuestionCircle className="item-icon" />
          <div className="item-text">
            <h4>About</h4>
            <p>App version, developer info</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>
      </div>
    </div>
  );
};

export default Settings;
