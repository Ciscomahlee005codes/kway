import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { FaLock, FaShieldAlt, FaUserShield, FaArrowLeft } from "react-icons/fa"; // ✅ Import Back icon
import "./Account.css";

const Account = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const toggle2FA = () => setTwoFAEnabled(!twoFAEnabled);

  return (
    <div className="account-container fade-in">
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate("/settings")}>
        <FaArrowLeft className="back-icon" /> Back
      </div>

      <h2 className="account-title slide-down">Account & Privacy</h2>

      {/* PRIVACY */}
      <div className="section-card pop-in">
        <div className="section-header">
          <FaShieldAlt className="icon" />
          <h3>Privacy Settings</h3>
        </div>

        <div className="option-row">
          <label>Show Last Seen</label>
          <select>
            <option>Everyone</option>
            <option>Contacts Only</option>
            <option>Nobody</option>
          </select>
        </div>

        <div className="option-row">
          <label>Profile Photo Visibility</label>
          <select>
            <option>Everyone</option>
            <option>Contacts Only</option>
            <option>Nobody</option>
          </select>
        </div>
      </div>

      {/* 2FA */}
      <div className="section-card pop-in">
        <div className="section-header">
          <FaUserShield className="icon" />
          <h3>Two-Factor Authentication</h3>
        </div>

        <div className="toggle-row">
          <label>Enable 2FA</label>
          <input type="checkbox" checked={twoFAEnabled} onChange={toggle2FA} />
        </div>

        {twoFAEnabled && (
          <input
            type="text"
            placeholder="Enter phone number for verification"
            className="input-field fade-in"
          />
        )}
      </div>

      {/* PASSWORD CHANGE */}
      <div className="section-card pop-in">
        <div className="section-header">
          <FaLock className="icon" />
          <h3>Password Change</h3>
        </div>

        <div className="input-group">
          <input type="password" placeholder="Current Password" />
          <input type="password" placeholder="New Password" />
          <input type="password" placeholder="Confirm New Password" />
        </div>

        <button className="save-btn bounce-in">Update Password</button>
      </div>
    </div>
  );
};

export default Account;
