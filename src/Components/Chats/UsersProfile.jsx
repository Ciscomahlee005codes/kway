import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoArrowBack, IoEllipsisVertical } from "react-icons/io5";
import { FiPhone, FiVideo, FiMail } from "react-icons/fi";
import CallModal from "./CallModal";
import EditProfileModal from "./EditProfileModal";
import "./UsersProfile.css";

const UsersProfile = () => {
  const navigate = useNavigate();
  const { state: user } = useLocation();

  const sheetRef = useRef(null);
  const dropdownRef = useRef(null);

  const startY = useRef(0);
  const [translateY, setTranslateY] = useState(0);
  const [callModal, setCallModal] = useState({ open: false, type: "voice" });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (!user) return <div className="profile-error">User not found</div>;


  /* ================= MOBILE DRAG ================= */
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) setTranslateY(diff);
  };

  const handleTouchEnd = () => {
    if (translateY > 120) navigate("/chat");
    else setTranslateY(0);
  };

  
  /* ================= SHARE CONTACT ================= */
  const handleShare = () => {
    const shareData = {
      title: "Kway Contact",
      text: `Connect with ${user.name} on Kway`,
      url: `${window.location.origin}/user/${user.username}`,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("Profile link copied!");
    }

    setDropdownOpen(false);
  };

  /* ================= OUTSIDE CLICK CLOSE ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="profile-overlay">
      <div
        ref={sheetRef}
        className="profile-sheet"
        style={{ transform: `translateY(${translateY}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="drag-handle" />

        {/* HEADER */}
        <div className="profile-header">
          <IoArrowBack
            className="back-icon"
            onClick={() => navigate("/chat")}
          />
          <h3>Profile</h3>

          {/* THREE DOT MENU */}
          <div className="menu-wrapper" ref={dropdownRef}>
            <IoEllipsisVertical
              className="menu-icon"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={handleShare}>
                  Share Contact
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setEditOpen(true);
                    setDropdownOpen(false);
                  }}
                >
                  Edit Contact
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AVATAR SECTION */}
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
              }
              alt={user.name}
              className="profile-avatar2"
            />
          </div>

          <h2>{user.name}</h2>
          <p className="username">@{user.username}</p>

          <span className={`status ${user.active ? "online" : "offline"}`}>
            {user.active ? "Online" : "Offline"}
          </span>
        </div>

        {/* ACTIONS */}
        <div className="profile-actions">
          <div
            className="action-card"
            onClick={() => setCallModal({ open: true, type: "voice" })}
          >
            <FiPhone />
            <span>Voice</span>
          </div>

          <div
            className="action-card"
            onClick={() => setCallModal({ open: true, type: "video" })}
          >
            <FiVideo />
            <span>Video</span>
          </div>
        </div>

        {/* INFO */}
        <div className="profile-info">
          <div className="info-row">
            <p className="label">Username</p>
            <p className="value">@{user.username}</p>
          </div>

          <div className="info-row">
            <p className="label">Email</p>
            <p className="value">
              <FiMail style={{ marginRight: "6px" }} />
              {user.email}
            </p>
          </div>

          <div className="info-row">
            <p className="label">About</p>
            <p className="value">
              {user.bio || "Hey there! I'm using Kway 💬"}
            </p>
          </div>

          <div className="info-row danger">Block User</div>
        </div>
      </div>

      {/* CALL MODAL */}
      {callModal.open && (
        <CallModal
          type={callModal.type}
          participant={user}
          onClose={() => setCallModal({ ...callModal, open: false })}
        />
      )}

      {/* EDIT MODAL */}
      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSave={(updatedData) => {
            console.log("Updated:", updatedData);
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default UsersProfile;
