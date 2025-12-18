import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaShieldAlt, FaUserShield, FaArrowLeft } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageContext";
import "./Account.css";

const Account = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const toggle2FA = () => setTwoFAEnabled(prev => !prev);

  return (
    <div className="account-container fade-in">
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate("/settings")}>
        <FaArrowLeft className="back-icon" /> {t("back")}
      </div>

      <h2 className="account-title slide-down">
        {t("accountPrivacy")}
      </h2>

      {/* PRIVACY */}
      <div className="section-card pop-in">
        <div className="section-header">
          <FaShieldAlt className="icon" />
          <h3>{t("privacySettings")}</h3>
        </div>

        <div className="option-row">
          <label>{t("showLastSeen")}</label>
          <select>
            <option>{t("everyone")}</option>
            <option>{t("contactsOnly")}</option>
            <option>{t("nobody")}</option>
          </select>
        </div>

        <div className="option-row">
          <label>{t("profilePhotoVisibility")}</label>
          <select>
            <option>{t("everyone")}</option>
            <option>{t("contactsOnly")}</option>
            <option>{t("nobody")}</option>
          </select>
        </div>
      </div>

      {/* 2FA */}
      <div className="section-card pop-in">
        <div className="section-header">
          <FaUserShield className="icon" />
          <h3>{t("twoFactorAuth")}</h3>
        </div>

        <div className="toggle-row">
          <label>{t("enable2FA")}</label>
          <input
            type="checkbox"
            checked={twoFAEnabled}
            onChange={toggle2FA}
          />
        </div>

        {twoFAEnabled && (
          <input
            type="text"
            placeholder={t("phonePlaceholder")}
            className="input-field fade-in"
          />
        )}
      </div>

      {/* PASSWORD CHANGE */}
      <div className="section-card pop-in">
        <div className="section-header">
          <FaLock className="icon" />
          <h3>{t("passwordChange")}</h3>
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder={t("currentPassword")}
          />
          <input
            type="password"
            placeholder={t("newPassword")}
          />
          <input
            type="password"
            placeholder={t("confirmPassword")}
          />
        </div>

        <button className="save-btn bounce-in">
          {t("updatePassword")}
        </button>
      </div>
    </div>
  );
};

export default Account;
