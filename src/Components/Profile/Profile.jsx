import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaBirthdayCake,
  FaUser,
  FaPalette,
} from "react-icons/fa";
import "./Profile.css";

const Profile = () => {
  const { session, loading } = UserAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [localPhoto, setLocalPhoto] = useState(null);

useEffect(() => {
  const savedPhoto = localStorage.getItem("profile_photo");
  if (savedPhoto) {
    setLocalPhoto(savedPhoto);
  }
}, []);


  useEffect(() => {
    if (loading) return; // wait for auth to restore

    if (!session?.user) {
      navigate("/", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return;
      }

      setProfile(data);
    };

    fetchProfile();
  }, [session, loading, navigate]);

  const handleEditPhoto = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    const base64Image = reader.result;

    localStorage.setItem("profile_photo", base64Image);
    setLocalPhoto(base64Image);
  };

  reader.readAsDataURL(file);
};


  // 🔥 No loading screen — just render nothing until ready
  if (!profile) return null;

  return (
    <div
      className="profile-container"
      style={{ "--theme-color": profile.theme }}
    >
      <motion.div
        className="profile-card-refined"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* HEADER */}
        <div className="profile-header-refined">
          <div className="profile-avatar-refined">
            <label className="edit-avatar-btn">
  ✏️
  <input
    type="file"
    accept="image/*"
    hidden
    onChange={handleEditPhoto}
  />
</label>

            {localPhoto || profile.photo ? (
  <img src={localPhoto || profile.photo} alt="Profile" />
) : (
              <div className="avatar-fallback">
                {profile.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="profile-name">{profile.name}</h2>
          <p className="profile-handle">@{profile.username}</p>
          <p className="profile-role">{profile.chat_mode}</p>
        </div>

        {/* ABOUT */}
        <div className="profile-section-refined">
          <h4>About</h4>
          <p>{profile.about || "No bio added yet."}</p>
        </div>

        {/* DETAILS */}
        <div className="profile-details-refined">
          <div className="profile-detail-item">
            <FaEnvelope className="detail-icon" />
            <span className="user-info">{session.user.email}</span>
          </div>

          <div className="profile-detail-item">
            <FaBirthdayCake className="detail-icon" />
            <span className="user-info">
              {profile.dob
                ? new Date(profile.dob).toLocaleDateString()
                : "Not set"}
            </span>
          </div>

          <div className="profile-detail-item">
            <FaUser className="detail-icon" />
            <span className="user-info">
              {profile.gender || "Not specified"}
            </span>
          </div>

          <div className="profile-detail-item">
            <FaPalette className="detail-icon" />
            <span className="user-info">Theme</span>
            <div
              className="theme-preview"
              style={{ background: profile.theme }}
            />
          </div>
        </div>

        <div className="profile-footer-refined">
          Joined{" "}
          {profile.created_at
            ? new Date(profile.created_at).toLocaleDateString()
            : ""}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
