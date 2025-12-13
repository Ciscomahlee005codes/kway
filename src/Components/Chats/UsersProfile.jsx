import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FiPhone, FiVideo } from "react-icons/fi";
import CallModal from "./CallModal";
import "./UsersProfile.css";

const UsersProfile = () => {
  const navigate = useNavigate();
  const { state: user } = useLocation();

  const sheetRef = useRef(null);
  const startY = useRef(0);
  const [translateY, setTranslateY] = useState(0);

  // ✅ MODAL STATE
  const [callModal, setCallModal] = useState({ open: false, type: "voice" });

  if (!user) return <div>User not found</div>;

  // ✅ TOUCH HANDLERS (MOBILE ONLY)
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (translateY > 120) {
      navigate("/chat"); // close sheet
    } else {
      setTranslateY(0);
    }
  };

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
        {/* DRAG HANDLE (MOBILE) */}
        <div className="drag-handle" />

        {/* HEADER */}
        <div className="profile-header">
          <IoArrowBack
            className="back-icon"
            onClick={() => navigate("/chat")}
          />
          <h3>Contact info</h3>
        </div>

        {/* AVATAR */}
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            <img
              src={
                user.avatar ||
                "https://api.dicebear.com/7.x/thumbs/svg?seed=user"
              }
              alt={user.name}
              className="profile-avatar2"
            />
          </div>

          <h2>{user.name}</h2>
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
            <span>Call</span>
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
            <p className="label">Phone</p>
            <p className="value">+234 XXX XXX XXXX</p>
          </div>

          <div className="info-row">
            <p className="label">About</p>
            <p className="value">Hey there! I’m using KWay 💬</p>
          </div>

          <div className="info-row danger">Block Contact</div>
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
    </div>
  );
};

export default UsersProfile;
