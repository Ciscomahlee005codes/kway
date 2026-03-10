import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext";
import { MdEdit } from "react-icons/md";
import toast from "react-hot-toast";
import {
  FaEnvelope,
  FaBirthdayCake,
  FaUser,
  FaPalette,
} from "react-icons/fa";
import "./Profile.css";

const Profile = () => {
  const { session, profile, setProfile, refreshProfile } = UserAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // =============================
  // 🔐 AUTH + FETCH PROFILE
  // =============================


  // =============================
  // 🖼️ UPDATE PROFILE PHOTO
  // =============================
 const handleEditPhoto = async (e) => {
  const file = e.target.files[0];
  if (!file || !session?.user) return;

  const fileExt = file.name.split(".").pop();
  const filePath = `${session.user.id}/avatar-${Date.now()}.${fileExt}`;

  try {
    // upload new image
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // get public url
    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const newPhotoUrl = data.publicUrl;

    // update database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ photo: newPhotoUrl })
      .eq("id", session.user.id);

    if (updateError) throw updateError;

    // update UI instantly
    setProfile((prev) => ({
      ...prev,
      photo: newPhotoUrl,
    }));

    toast.success("Profile picture updated 🎉");

  } catch (err) {
    console.error(err);
    toast.error("Failed to update photo");
  }
};

  // ⛔ Prevent early render
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
        {/* ================= HEADER ================= */}
        <div className="profile-header-refined">
          <div className="profile-avatar-refined">
            <label className="edit-avatar-btn">
              <MdEdit className="edit-icon" />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleEditPhoto}
              />
            </label>

            {profile.photo ? (
             <img src={profile.photo} alt="profile" />
            ) : (
              <div className="avatar-fallback">
                {profile.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="profile-name">
            {profile.name || t("profileName")}
          </h2>

          <p className="profile-handle">@{profile.username}</p>
          <p className="profile-role">{profile.chat_mode}</p>
        </div>

        {/* ================= ABOUT ================= */}
        <div className="profile-section-refined">
          <h4>{t("about")}</h4>
          <p>{profile.about || t("bioPlaceholder")}</p>
        </div>

        {/* ================= DETAILS ================= */}
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
                : t("notSet")}
            </span>
          </div>

          <div className="profile-detail-item">
            <FaUser className="detail-icon" />
            <span className="user-info">
              {profile.gender || t("notSpecified")}
            </span>
          </div>

          <div className="profile-detail-item">
            <FaPalette className="detail-icon" />
            <span className="user-info">{t("theme")}</span>
            <div
              className="theme-preview"
              style={{ background: profile.theme }}
            />
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="profile-footer-refined">
          {t("joined")}{" "}
          {profile.created_at
            ? new Date(profile.created_at).toLocaleDateString()
            : ""}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
