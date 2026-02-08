import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext";
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
  const { t } = useLanguage();

  // =============================
  // 🔐 AUTH + FETCH PROFILE
  // =============================
  useEffect(() => {
    if (loading) return;

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

  // =============================
  // 🖼️ UPDATE PROFILE PHOTO
  // =============================
  const handleEditPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file || !session?.user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      await supabase
        .from("profiles")
        .update({ photo: data.publicUrl })
        .eq("id", session.user.id);

      // 🔥 Instant UI update
      setProfile((prev) => ({
        ...prev,
        photo: data.publicUrl,
      }));
    } catch (err) {
      console.error("Photo update error:", err);
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
              ✏️
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleEditPhoto}
              />
            </label>

            {profile.photo ? (
              <img src={profile.photo} alt="Profile" />
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
