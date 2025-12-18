import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCamera, IoCheckmark } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "./ProfileSetup.css";

const chatModes = ["Calm 🌿", "Vibes ✨", "Cruise 😎", "Savage 😂", "Focus 🎧"];

const ProfileSetup = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [theme, setTheme] = useState("#0d6329");

  const [dob, setDob] = useState("");
  const [chatMode, setChatMode] = useState("Calm 🌿");

  const [showSuccess, setShowSuccess] = useState(false);
  const [gender, setGender] = useState("");


  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const generateAvatar = () => {
    const random = Math.floor(Math.random() * 1000);
    setPhoto(`https://api.dicebear.com/7.x/thumbs/svg?seed=${random}`);
  };
  
  const handleConfirm = () => {
  const userData = {
    photo,
    name,
    username,
    about,
    theme,
    dob,
    chatMode,
    gender,
  };

  console.log("FINAL USER DATA:", userData);

  setShowSuccess(true);

  setTimeout(() => {
    navigate("/chat");
  }, 3200);
};


  return (
    <div className="profile-setup-container">
      <motion.div
        className="profile-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* STEP INDICATOR */}
        <div className="step-indicator">
          {[1, 2, 3].map((s) => (
            <span key={s} className={step === s ? "active" : ""}>
              {s}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
            >
              <div className="photo-area">
                <div className="photo-circle" style={{ borderColor: theme }}>
                  {photo ? <img src={photo} alt="" /> : <IoCamera />}
                </div>

                <label className="upload-btn">
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handlePhotoChange} />
                </label>

                <button className="avatar-btn" onClick={generateAvatar}>
                  Random Avatar
                </button>
              </div>

              <div className="input-group">
                <label>Display Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Bio</label>
                <textarea value={about} onChange={(e) => setAbout(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Theme Color</label>
                <input
                  type="color"
                  className="color-picker"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                />
              </div>

              <button
                className="save-btn"
                style={{ backgroundColor: theme }}
                onClick={() => setStep(2)}
              >
                Next →
              </button>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
            >
              <h3 className="step-title">Make it Personal ✨</h3>

              <div className="input-group">
                <label>Date of Birth 🎂</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                <small>We’ll celebrate you on your birthday 🎉</small>
              </div>

              <div className="input-group">
                <label>Chat Mood</label>
                <div className="mode-picker">
                  {chatModes.map((mode) => (
                    <button
                      key={mode}
                      className={`mode-btn ${chatMode === mode ? "active" : ""}`}
                      onClick={() => setChatMode(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
  <label>Gender</label>
  <div className="gender-picker">
    <button
      className={`gender-btn ${gender === "male" ? "active" : ""}`}
      onClick={() => setGender("male")}
    >
      👨 Male
    </button>

    <button
      className={`gender-btn ${gender === "female" ? "active" : ""}`}
      onClick={() => setGender("female")}
    >
      👩 Female
    </button>
  </div>
</div>


              <button
                className="save-btn"
                style={{ backgroundColor: theme }}
                onClick={() => setStep(3)}
              >
                Review Profile →
              </button>
            </motion.div>
          )}

          {/* STEP 3 – REVIEW */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
            >
              <h3 className="step-title">Review Your Profile 👀</h3>

              <div className="review-card">
                <img
                  src={photo || "https://api.dicebear.com/7.x/thumbs/svg?seed=default"}
                  alt=""
                />
                <div className="review-info">
                  <h4>{name}</h4>
                  <p className="username">@{username}</p>
                  <p>{about}</p>
                  <p><strong>Birthday:</strong> {dob}</p>
                  <p><strong>Chat Mode:</strong> {chatMode}</p>
                  <div className="theme-preview">
                    <strong>Theme:</strong>
                    <span className="color-dot" style={{ backgroundColor: theme }} />
                  </div>
                </div>
              </div>

              <div className="review-actions">
                <button className="back-btn" onClick={() => setStep(2)}>
                  ← Back
                </button>

                <button
                  className="save-btn"
                  style={{ backgroundColor: theme }}
                  onClick={handleConfirm}
                >
                  Confirm & Continue 🚀
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* SUCCESS MODAL */}
       {showSuccess && (
  <motion.div
    className="success-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="success-modal"
      initial={{ scale: 0.75, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 12,
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 0.9,
        }}
        style={{ color: theme }}
      >
        Kway @{username?.toLowerCase() || "friend"} 👋
      </motion.h2>

      <p style={{ marginTop: "8px", opacity: 0.7 }}>
        Setting things up for you…
      </p>
    </motion.div>
  </motion.div>
)}


    </div>
  );
};

export default ProfileSetup;
