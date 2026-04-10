// src/components/Chats/CallModal.jsx
import React, { useEffect, useRef } from "react";
import "./CallModal.css";
import { MdCallEnd } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";

const CallModal = ({ type = "voice", participant, onClose, }) => {
  const audioRef = useRef(null);
  

  useEffect(() => {
    // Play ringtone
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    // Auto close after 15s
    const t = setTimeout(() => onClose(), 15000);

    return () => {
      clearTimeout(t);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [onClose]);

const renderCallAvatar = () => {
  const name = participant?.name || "User";
  const firstLetter = name.charAt(0).toUpperCase();

  // Get avatar — if stored in Supabase storage, convert to public URL
  let avatarUrl = participant?.avatar || "";
  if (avatarUrl && !avatarUrl.startsWith("http")) {
    // Assume it's a Supabase storage path
    avatarUrl = supabase.storage
      .from("avatars") // <- replace with your bucket name
      .getPublicUrl(avatarUrl).data.publicUrl;
  }

  const colors = ["#1dbf73", "#34b7f1", "#ff9800", "#e91e63", "#9c27b0"];
  const bgColor = colors[name.charCodeAt(0) % colors.length] || "#1dbf73";

  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="call-avatar" />;
  }

  // fallback: first letter
  return (
    <div className="call-avatar-letter" style={{ backgroundColor: bgColor }}>
      {firstLetter}
    </div>
  );
};

  return (
    <div className="call-overlay">
      <audio ref={audioRef} src="/ringtone.mp3" />

      <div className="call-container">
        {/* AVATAR */}
        <div className="call-avatar-wrapper animate-bounce">
  {renderCallAvatar()}
</div>

        {/* USER INFO */}
        <div className="call-info-text">
          <h2>{participant?.name}</h2>
          <p>{type === "voice" ? "Ringing…" : "Video calling…"}</p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="call-actions">

          {/* Cancel icon (WhatsApp reject style) */}
          <button className="call-circle cancel" onClick={onClose}>
            <IoMdClose size={30} />
          </button>

          {/* End call icon */}
          <button className="call-circle end" onClick={onClose}>
            <MdCallEnd size={30} />
          </button>

        </div>
      </div>
    </div>
  );
};

export default CallModal;
