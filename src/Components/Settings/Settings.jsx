import React, { useState, useEffect } from "react";
import { IoChevronForward } from "react-icons/io5";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";
import {
  FaLock,
  FaBell,
  FaPaintBrush,
  FaInfoCircle,
  FaQuestionCircle,
  FaLanguage,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { session } = UserAuth();

  const [profile, setProfile] = useState(null);

  // 🔥 SAME FETCH LOGIC AS PROFILE PAGE
  useEffect(() => {
    if (!session?.user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*") // get photo too
        .eq("id", session.user.id)
        .single();

      if (!error) {
        setProfile(data);
      } else {
        console.error("Profile fetch error:", error);
      }
    };

    fetchProfile();
  }, [session]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app-theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  if (!profile) return null;

  return (
    <div className="settings-page">

      <div className="settings-header">
        <h2>{t("settings")}</h2>
      </div>

      {/* ================= PROFILE TOP ================= */}
      <div
        className="settings-profile"
        onClick={() => navigate("/profile")}
      >
        {profile.photo ? (
          <img
            src={profile.photo}
            alt="Profile"
            className="settings-avatar"
          />
        ) : (
          <div className="settings-avatar-fallback">
            {profile.username?.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="profile-info">
          <h3>{profile.name || t("profileName")}</h3>
          <p className="profile-bio">
            {profile.about || t("bioPlaceholder")}
          </p>
        </div>

        <IoChevronForward className="profile-arrow" />
      </div>

      {/* ================= SETTINGS LIST ================= */}
      <div className="settings-list">

        <div
          className="settings-item"
          onClick={() => navigate("/settings/account")}
        >
          <FaLock className="item-icon" />
          <div className="item-text">
            <h4>{t("account")}</h4>
            <p>{t("accountDesc")}</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

        <div
          className="settings-item"
          onClick={() => navigate("/settings/notifications")}
        >
          <FaBell className="item-icon" />
          <div className="item-text">
            <h4>{t("notifications")}</h4>
            <p>{t("notificationsDesc")}</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

        <div className="settings-item">
          <FaPaintBrush className="item-icon" />
          <div className="item-text">
            <h4>{t("appearance")}</h4>
            <p>{t("appearanceDesc")}</p>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={toggleTheme}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div
          className="settings-item"
          onClick={() => navigate("/settings/language")}
        >
          <FaLanguage className="item-icon" />
          <div className="item-text">
            <h4>{t("language")}</h4>
            <p>{t("languageDesc")}</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

        <div
          className="settings-item"
          onClick={() => navigate("/settings/help")}
        >
          <FaInfoCircle className="item-icon" />
          <div className="item-text">
            <h4>{t("help")}</h4>
            <p>{t("helpDesc")}</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

        <div
          className="settings-item"
          onClick={() => navigate("/settings/about")}
        >
          <FaQuestionCircle className="item-icon" />
          <div className="item-text">
            <h4>{t("about")}</h4>
            <p>{t("aboutDesc")}</p>
          </div>
          <IoChevronForward className="item-arrow" />
        </div>

      </div>
    </div>
  );
};

export default Settings;
