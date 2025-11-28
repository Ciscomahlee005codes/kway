import React, { useState, useEffect } from "react";
import { IoChevronForward } from "react-icons/io5";
import { 
  FaUserCircle, FaLock, FaBell, FaPaintBrush, 
  FaInfoCircle, FaQuestionCircle, FaLanguage 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings = () => {

  const navigate = useNavigate();

  // Default theme = light
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("app-theme");
    return saved ? saved : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <div className="settings-page">
      
      <div className="settings-header">
        <h2>Settings</h2>
      </div>

      {/* PROFILE SECTION */}
      <div 
        className="settings-profile"
        onClick={() => navigate("/profile")}
      >
        <FaUserCircle className="profile-picture" />
        <div className="profile-info">
          <h3>John Doe</h3>
          <p>Hey there! I’m using Kway Chat 😎</p>
        </div>
      </div>

      <div className="settings-list">

        {/* ACCOUNT */}
        <div 
          className="settings-item"
          onClick={() => navigate("/settings/account")}
        >
          <FaLock className="item-icon" />
          <div className="item-text">
            <h4>Account</h4>
            <p>Privacy, security, change number</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

        {/* NOTIFICATIONS */}
        <div 
          className="settings-item"
          onClick={() => navigate("/settings/notifications")}
        >
          <FaBell className="item-icon" />
          <div className="item-text">
            <h4>Notifications</h4>
            <p>Messages & call tones</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

        {/* APPEARANCE */}
        <div className="settings-item">
          <FaPaintBrush className="item-icon" />
          <div className="item-text">
            <h4>Appearance</h4>
            <p>Light / Dark mode</p>
          </div>

          {/* SWITCH */}
          <label className="switch">
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={toggleTheme}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* LANGUAGE */}
        <div 
          className="settings-item"
          onClick={() => navigate("/settings/language")}
        >
          <FaLanguage className="item-icon" />
          <div className="item-text">
            <h4>Language</h4>
            <p>App language</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

        {/* HELP */}
        <div 
          className="settings-item"
          onClick={() => navigate("/settings/help")}
        >
          <FaInfoCircle className="item-icon" />
          <div className="item-text">
            <h4>Help</h4>
            <p>FAQ, Contact Support</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

        {/* ABOUT */}
        <div 
          className="settings-item"
          onClick={() => navigate("/settings/about")}
        >
          <FaQuestionCircle className="item-icon" />
          <div className="item-text">
            <h4>About</h4>
            <p>Version, Developer info</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

      </div>

    </div>
  );
};

export default Settings;
