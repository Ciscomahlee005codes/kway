// src/components/Chats/CallModal.jsx
import React, { useEffect, useRef } from "react";
import "./CallModal.css";
import { MdCallEnd } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";

const CallModal = ({ type = "voice", participant, onClose }) => {
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

  return (
    <div className="call-overlay">
      <audio ref={audioRef} src="/ringtone.mp3" />

      <div className="call-container">
        {/* AVATAR */}
        <div className="call-avatar-wrapper animate-bounce">
          <img
            src={participant?.avatar || "/mnt/data/KwayChat.png"}
            alt={participant?.name}
            className="call-avatar"
          />
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
