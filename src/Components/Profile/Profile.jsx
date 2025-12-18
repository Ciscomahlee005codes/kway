import React from "react";
import "./Profile.css";
import profilePic from "../../assets/profile-img.jpg";
import bannerImg from "../../assets/cover-img.jpg";

import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCommentDots,
} from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { useLanguage } from "../../Context/LanguageContext";

const Profile = () => {
  const { t } = useLanguage();

  return (
    <div className="profile-container">

      <div className="profile-header">
        <img src={bannerImg} alt="Banner" className="profile-banner" />

        <div className="profile-avatar">
          <img src={profilePic} alt="Profile" />
          <span className="online-dot"></span>
        </div>
      </div>

      <div className="profile-body">
        <h2>Adam Zampa</h2>
        <p className="profile-handle">@adamz</p>
        <p className="profile-role">{t("profileRole")}</p>

        <p className="profile-bio">{t("bioPlaceholder")}</p>

        {/* Stats */}
        <div className="profile-stats">
          <div>
            <strong>152</strong>
            <span>{t("posts")}</span>
          </div>
          <div>
            <strong>820</strong>
            <span>{t("contacts")}</span>
          </div>
          <div>
            <strong>98</strong>
            <span>{t("media")}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="profile-actions">
          <button className="btn-primary">
            <FaCommentDots /> {t("message")}
          </button>
          <button className="btn-primary">
            <FaPhoneAlt /> {t("call")}
          </button>
          <button className="btn-more">
            <FiMoreVertical />
          </button>
        </div>

        {/* Contact details (values NOT translated) */}
        <div className="profile-details">
          <div className="profile-detail-item">
            <FaUser className="detail-icon" />
            <span>Adam Zampa</span>
          </div>
          <div className="profile-detail-item">
            <FaEnvelope className="detail-icon" />
            <span>admin@themesbrand.com</span>
          </div>
          <div className="profile-detail-item">
            <FaMapMarkerAlt className="detail-icon" />
            <span>California, USA</span>
          </div>
        </div>

        {/* Highlights */}
        <div className="profile-highlights">
          <div className="highlight-box">🏝️ {t("trips")}</div>
          <div className="highlight-box">🎥 {t("reels")}</div>
          <div className="highlight-box">👨‍💻 {t("code")}</div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
