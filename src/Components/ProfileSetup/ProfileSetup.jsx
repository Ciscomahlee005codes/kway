import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoCamera } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { IoCheckmark } from "react-icons/io5";

import "./ProfileSetup.css";

const ProfileSetup = () => {
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const [theme, setTheme] = useState("#0d6329"); // default green

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
    }
  };

  const generateAvatar = () => {
    const random = Math.floor(Math.random() * 10);
    setPhoto(`https://api.dicebear.com/7.x/thumbs/svg?seed=${random}`);
  };

   const handleSubmit = () => {
  if (!name) return;

  const userData = { photo, name, username, about, theme };
  console.log("USER DATA:", userData);

  // Show success popup
  setShowSuccess(true);

  // Redirect to chats after animation
  setTimeout(() => {
    navigate("/chat");
  }, 1600);
};


  return (
    <div className="profile-setup-container">
      <motion.div
        className="profile-card"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* PHOTO SECTION */}
        <div className="photo-area">
          <div className="photo-circle" style={{ borderColor: theme }}>
            {photo ? (
              <img src={photo} alt="profile" />
            ) : (
              <IoCamera className="camera-icon" />
            )}
          </div>

          <label className="upload-btn">
            Upload Photo
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </label>

          <button className="avatar-btn" onClick={generateAvatar}>
            Random Avatar
          </button>
        </div>

        {/* INPUTS */}
        <div className="input-group">
          <label>Display Name</label>
          <input
            type="text"
            placeholder="Your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Username (unique)</label>
          <input
            type="text"
            placeholder="@username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>About / Bio</label>
          <textarea
            placeholder="I'm available ✨"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          ></textarea>
        </div>

        {/* THEME PICKER */}
        <div className="input-group">
          <label>Theme Color</label>
          <input
            type="color"
            className="color-picker"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </div>

        {/* LIVE PREVIEW */}
        <div className="preview-card" style={{ borderColor: theme }}>
          <img
            src={
              photo ||
              "https://api.dicebear.com/7.x/thumbs/svg?seed=default"
            }
            alt=""
          />
          <div>
            <h4>{name || "Your Name"}</h4>
            <p className="username">@{username || "username"}</p>
            <p>{about || "Bio shows here..."}</p>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button className="save-btn" style={{ backgroundColor: theme }} onClick={handleSubmit}>
          Save Profile
        </button>
      </motion.div>

      {showSuccess && (
  <motion.div
    className="success-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="success-modal"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <motion.div
        className="check-circle"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <IoCheckmark />
      </motion.div>

      <h3>Profile Ready!</h3>
      <p>Taking you to chats…</p>
    </motion.div>
  </motion.div>
)}

    </div>
  );
};

export default ProfileSetup;
