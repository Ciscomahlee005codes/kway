import React, { useState, useEffect } from "react";
import { IoChevronForward } from "react-icons/io5";
import { 
  FaUserCircle, FaLock, FaBell, FaPaintBrush, 
  FaInfoCircle, FaQuestionCircle, FaLanguage 
} from "react-icons/fa";
import "./Settings.css";

const Settings = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="settings-page">
      
      <div className="settings-header">
        <h2>Settings</h2>
      </div>

      <div className="settings-profile">
        <FaUserCircle className="profile-picture" />
        <div className="profile-info">
          <h3>John Doe</h3>
          <p>Hey there! I’m using Kway Chat 😎</p>
        </div>
      </div>

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
            <p>Light / Dark theme</p>
          </div>

          <label className="switch">
            <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
            <span className="slider"></span>
          </label>
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
            <p>FAQ, contact us</p>
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
