import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack, IoEllipsisVertical } from "react-icons/io5";
import { FiPhone, FiVideo } from "react-icons/fi";
import CallModal from "./CallModal";
import EditProfileModal from "./EditProfileModal";
import "./UsersProfile.css";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";

const UsersProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { session } = UserAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [callModal, setCallModal] = useState({ open: false, type: "voice" });

  const dropdownRef = useRef(null);

  // =========================================
  // ✅ FETCH USER LIKE LINKUP PAGE
  // =========================================
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, username, photo, about")
        .eq("id", id)
        .single();

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      setUser(data);
      setLoading(false);
    };

    fetchUser();
  }, [id]);

  // =========================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // =========================================
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (loading) return <div className="profile-error">Loading profile...</div>;
  if (!user) return <div className="profile-error">User not found</div>;

  // =========================================
  // SHARE CONTACT
  // =========================================
  const handleShare = () => {
    const url = `${window.location.origin}/user-profile/${user.id}`;

    navigator.clipboard.writeText(url);
    alert("Profile link copied!");
  };

  return (
    <div className="profile-overlay">
      <div className="profile-sheet">

        {/* HEADER */}
        <div className="profile-header">
          <button
            type="button"
            className="profile-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <IoArrowBack className="back-icon" />
          </button>
          <div className="profile-header-title">
            <h3>Profile</h3>
            <span>Contact details</span>
          </div>

          <div className="menu-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className="profile-icon-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Profile options"
              aria-expanded={dropdownOpen}
            >
              <IoEllipsisVertical className="menu-icon" />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <button type="button" onClick={handleShare}>Share Contact</button>
                {session?.user?.id === user.id && (
                  <button type="button" onClick={() => setEditOpen(true)}>Edit Profile</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AVATAR */}
        <div className="profile-hero">
          <div className="profile-cover" aria-hidden="true" />
          <div className="profile-avatar-section">
            <button
              type="button"
              className="profile-avatar-button"
              onClick={() => setShowPreview(true)}
              aria-label={`View ${user.name || "user"}'s profile photo`}
            >
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name || "User"}
                  className="profile-avatar2"
                />
              ) : (
                <span className="profile-avatar-fallback">
                  {(user.name || user.username || "?").charAt(0).toUpperCase()}
                </span>
              )}
              <span className="avatar-view-hint">View photo</span>
            </button>
            <h2>{user.name || "Kway user"}</h2>
            <p className="username">@{user.username || "member"}</p>
            <span className="profile-member-badge">Kway profile</span>
          </div>
        </div>

        {/* ACTIONS */}
        <section className="profile-actions-section" aria-label="Contact actions">
          <h4 className="profile-section-title">Get in touch</h4>
          <div className="profile-actions">
          <button
            type="button"
            className="action-card"
            onClick={() => setCallModal({ open: true, type: "voice" })}
          >
            <span className="action-icon"><FiPhone /></span>
            <span className="action-label">Voice call</span>
          </button>

          <button
            type="button"
            className="action-card"
            onClick={() => setCallModal({ open: true, type: "video" })}
          >
            <span className="action-icon"><FiVideo /></span>
            <span className="action-label">Video call</span>
          </button>
          </div>
        </section>

        {/* INFO */}
        <div className="profile-info">
          <div className="info-row username-info">
            <span className="info-icon">@</span>
            <div className="info-copy">
              <p className="label">Username</p>
              <p className="value">@{user.username || "member"}</p>
            </div>
          </div>

          <div className="info-row">
            <span className="info-icon about-icon">“</span>
            <div className="info-copy">
              <p className="label">About</p>
              <p className="value">
                {user.about || "This user hasn't added an about section yet."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CALL MODAL */}
      {callModal.open && (
        <CallModal
          type={callModal.type}
          participant={{
            name: user.name,
            avatar: user.photo
          }}
          onClose={() => setCallModal({ ...callModal, open: false })}  
        />
      )}

      {/* EDIT MODAL */}
      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSave={(data) => {
            setUser(data);
            setEditOpen(false);
          }}
        />
      )}
      {showPreview && (
  <div
    className="avatar-preview-overlay"
    onClick={() => setShowPreview(false)}
  >
    <div
      className="avatar-preview-container"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="avatar-preview-close"
        onClick={() => setShowPreview(false)}
      >
        ✕
      </button>

      <img
        src={
          user.photo ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
        }
        alt="preview"
        className="avatar-preview-image"
      />

      
    </div>
  </div>
)}
    </div>
  );
};

export default UsersProfile;
