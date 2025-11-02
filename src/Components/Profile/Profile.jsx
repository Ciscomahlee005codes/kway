import React from "react";
import "./Profile.css";
import profilePic from "../../assets/profile-img.jpg"; 
import bannerImg from "../../assets/cover-img.jpg"; 

import { FaUser, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaCommentDots } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";

const Profile = () => {
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
        <p className="profile-role">Front End Developer</p>

        <p className="profile-bio">
          Crafting beautiful web experiences ✨ | React | UI/UX | Tech lover 👨‍💻
        </p>

        {/* Stats */}
        <div className="profile-stats">
          <div><strong>152</strong><span>Posts</span></div>
          <div><strong>820</strong><span>Contacts</span></div>
          <div><strong>98</strong><span>Media</span></div>
        </div>

        {/* Buttons */}
        <div className="profile-actions">
          <button className="btn-primary"><FaCommentDots /> Message</button>
          <button className="btn-primary"><FaPhoneAlt /> Call</button>
          <button className="btn-more"><FiMoreVertical /></button>
        </div>

        {/* Contact details */}
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

        {/* Story highlight row */}
        <div className="profile-highlights">
          <div className="highlight-box">🏝️ Trips</div>
          <div className="highlight-box">🎥 Reels</div>
          <div className="highlight-box">👨‍💻 Code</div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
