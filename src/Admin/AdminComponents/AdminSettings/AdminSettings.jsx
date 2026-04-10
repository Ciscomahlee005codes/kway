import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaBell,
  FaGlobe,
  FaQuestionCircle,
  FaTrash
} from "react-icons/fa";
import { IoMoon, IoSunny } from "react-icons/io5";
import "./AdminSettings.css";

const AdminSettings = () => {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="admin-settings-container">
      <h2 className="admin-title">Admin Settings</h2>

      {/* ACCOUNT */}
      <div className="admin-section">
        <h3 className="admin-section-title">Account</h3>

        <div className="admin-item">
          <div className="left">
            <FaUser className="admin-icon" />
            <span>Profile Information</span>
          </div>
        </div>

        <div className="admin-item">
          <div className="left">
            <FaLock className="admin-icon" />
            <span>Change Password</span>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="admin-section">
        <h3 className="admin-section-title">Notifications</h3>

        <div className="admin-item">
          <div className="left">
            <FaBell className="admin-icon" />
            <span>Enable Notifications</span>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled(!notificationsEnabled)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* APPEARANCE */}
      <div className="admin-section">
        <h3 className="admin-section-title">Appearance</h3>

        <div className="admin-item">
          <div className="left">
            {theme === "dark" ? (
              <IoMoon className="admin-icon" />
            ) : (
              <IoSunny className="admin-icon" />
            )}
            <span>Dark Mode</span>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={() => setTheme(theme === "light" ? "dark" : "light")}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* LANGUAGE */}
      <div className="admin-section">
        <h3 className="admin-section-title">Language</h3>

        <div className="admin-item">
          <div className="left">
            <FaGlobe className="admin-icon" />
            <span>App Language</span>
          </div>

          <select
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="yo">Yoruba</option>
            <option value="ig">Igbo</option>
            <option value="ha">Hausa</option>
            <option value="pj">Pidgin</option>
          </select>
        </div>
      </div>

      {/* HELP */}
      <div className="admin-section">
        <h3 className="admin-section-title">Support</h3>

        <div className="admin-item">
          <div className="left">
            <FaQuestionCircle className="admin-icon" />
            <span>Help & Support</span>
          </div>
        </div>
      </div>

      {/* DANGER */}
      <div className="admin-section danger">
        <h3 className="admin-section-title">Danger Zone</h3>

        <div className="admin-item delete">
          <div className="left">
            <FaTrash className="admin-icon" />
            <span>Delete Account</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
