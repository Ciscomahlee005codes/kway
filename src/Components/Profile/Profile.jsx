import React from "react";
import "./Profile.css";
import profilePic from "../../assets/profile-img.jpg"; 
import bannerImg from "../../assets/cover-img.jpg"; 
import { FaUser, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Profile = () => {
  return (
    <div className="profile-container">
      {/* Header with background */}
      <div className="profile-header">
        <img src={bannerImg} alt="Banner" className="profile-banner" />
        <div className="profile-avatar">
          <img src={profilePic} alt="Profile" />
        </div>
      </div>

      {/* User Info */}
      <div className="profile-body">
        <h2>Adam Zampa</h2>
        <p className="profile-role">Front End Developer</p>
        <p className="profile-bio">
          If several languages coalesce, the grammar of the resulting language
          is more simple.
        </p>

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
      </div>
    </div>
  );
};

export default Profile;
