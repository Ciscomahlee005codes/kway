import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaVolumeUp,
  FaMoon,
  FaToggleOn,
  FaToggleOff,
  FaArrowLeft,
} from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageContext";
import "./NotificationPage.css";

const NotificationPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [dndEnabled, setDndEnabled] = useState(false);

  return (
    <div className="notification-container fade-in">
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate("/settings")}>
        <FaArrowLeft className="back-icon" /> {t("back")}
      </div>

      <h2 className="notification-title slide-down">
        {t("notificationSettings")}
      </h2>

      {/* PUSH NOTIFICATIONS */}
      <div className="section-card pop-in">
        <div className="section-header">
          <FaBell className="icon" />
          <h3>{t("pushNotifications")}</h3>
        </div>

        <div className="toggle-row">
          <label>{t("enablePush")}</label>
          <div onClick={() => setPushEnabled(!pushEnabled)}>
            {pushEnabled ? (
              <FaToggleOn className="toggle on" />
            ) : (
              <FaToggleOff className="toggle off" />
            )}
          </div>
        </div>
      </div>

      {/* MESSAGE ALERTS */}
      <div className="section-card pop-in">
        <div className="section-header">
          <FaVolumeUp className="icon" />
          <h3>{t("messageAlerts")}</h3>
        </div>

        <div className="toggle-row">
          <label>{t("notificationSound")}</label>
          <div onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? (
              <FaToggleOn className="toggle on" />
            ) : (
              <FaToggleOff className="toggle off" />
            )}
          </div>
        </div>

        <div className="toggle-row">
          <label>{t("vibration")}</label>
          <div onClick={() => setVibrationEnabled(!vibrationEnabled)}>
            {vibrationEnabled ? (
              <FaToggleOn className="toggle on" />
            ) : (
              <FaToggleOff className="toggle off" />
            )}
          </div>
        </div>

        {soundEnabled && (
          <select className="tone-select fade-in">
            <option>{t("classicTone")}</option>
            <option>{t("ping")}</option>
            <option>{t("softBeep")}</option>
            <option>{t("crystalDrop")}</option>
          </select>
        )}
      </div>

      {/* DO NOT DISTURB */}
      <div className="section-card pop-in">
        <div className="section-header">
          <FaMoon className="icon" />
          <h3>{t("doNotDisturb")}</h3>
        </div>

        <div className="toggle-row">
          <label>{t("activateDnd")}</label>
          <div onClick={() => setDndEnabled(!dndEnabled)}>
            {dndEnabled ? (
              <FaToggleOn className="toggle on" />
            ) : (
              <FaToggleOff className="toggle off" />
            )}
          </div>
        </div>

        {dndEnabled && (
          <p className="dnd-text fade-in">{t("dndDescription")}</p>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
