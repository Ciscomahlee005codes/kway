import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { FaBell, FaVolumeUp, FaMoon, FaToggleOn, FaToggleOff, FaArrowLeft } from "react-icons/fa"; // ✅ Add back icon
import "./NotificationPage.css";

const NotificationPage = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [dndEnabled, setDndEnabled] = useState(false);

  return (
    <div className="notification-container fade-in">
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate("/settings")}>
        <FaArrowLeft className="back-icon" /> Back
      </div>

      <h2 className="notification-title slide-down">Notification Settings</h2>

      {/* PUSH NOTIFICATIONS */}
      <div className="section-card pop-in">
        <div className="section-header">
          <FaBell className="icon" />
          <h3>Push Notifications</h3>
        </div>

        <div className="toggle-row">
          <label>Enable Push Notifications</label>
          <div onClick={() => setPushEnabled(!pushEnabled)}>
            {pushEnabled ? <FaToggleOn className="toggle on" /> : <FaToggleOff className="toggle off" />}
          </div>
        </div>
      </div>

      {/* MESSAGE ALERTS */}
      <div className="section-card pop-in">
        <div className="section-header">
          <FaVolumeUp className="icon" />
          <h3>Message Alerts</h3>
        </div>

        <div className="toggle-row">
          <label>Notification Sound</label>
          <div onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <FaToggleOn className="toggle on" /> : <FaToggleOff className="toggle off" />}
          </div>
        </div>

        <div className="toggle-row">
          <label>Vibration</label>
          <div onClick={() => setVibrationEnabled(!vibrationEnabled)}>
            {vibrationEnabled ? <FaToggleOn className="toggle on" /> : <FaToggleOff className="toggle off" />}
          </div>
        </div>

        {soundEnabled && (
          <select className="tone-select fade-in">
            <option>Classic Tone</option>
            <option>Ping</option>
            <option>Soft Beep</option>
            <option>Crystal Drop</option>
          </select>
        )}
      </div>

      {/* DO NOT DISTURB */}
      <div className="section-card pop-in">
        <div className="section-header">
          <FaMoon className="icon" />
          <h3>Do Not Disturb</h3>
        </div>

        <div className="toggle-row">
          <label>Activate DND Mode</label>
          <div onClick={() => setDndEnabled(!dndEnabled)}>
            {dndEnabled ? <FaToggleOn className="toggle on" /> : <FaToggleOff className="toggle off" />}
          </div>
        </div>

        {dndEnabled && (
          <p className="dnd-text fade-in">All notifications will be silenced.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
