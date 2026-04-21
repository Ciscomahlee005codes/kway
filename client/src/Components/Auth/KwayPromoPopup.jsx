import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./KwayPromoPopup.css";

import MpAImage from "../../assets/Mpa_AI2.png";

const KwayPromoPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const lastSeen = localStorage.getItem("kwayPromoLastSeen");

    if (!lastSeen) {
      setShowPopup(true);
      return;
    }

    const now = new Date().getTime();
    const diff = now - Number(lastSeen);

    const hours24 = 24 * 60 * 60 * 1000;

    if (diff > hours24) {
      setShowPopup(true);
    }
  }, []);

  const closePopup = () => {
    localStorage.setItem(
      "kwayPromoLastSeen",
      new Date().getTime()
    );

    setShowPopup(false);
  };

  const openMpAChat = () => {
  localStorage.setItem(
    "kwayPromoLastSeen",
    new Date().getTime()
  );

  setShowPopup(false); // ✅ CLOSE POPUP FIRST

  navigate("/chat/mpa-ai"); // ✅ correct route
};

  return (
    <AnimatePresence>
      {showPopup && (
        <div className="promo-overlay">
          <motion.div
            className="promo-box"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
          >
            {/* Mp.A IMAGE */}
            <img
              src={MpAImage}
              alt="Mp.A AI Assistant"
              className="promo-img"
            />

            {/* TEXT */}
            <h2 className="promo-title">
              Meet Mp.A 🤖
            </h2>

            <p className="promo-sub">
              Your smart assistant inside Kway.
              Ask anything. Chat instantly.
              Get help faster.
            </p>

            {/* CTA BUTTON */}
            <button
              className="promo-cta"
              onClick={openMpAChat}
            >
              Ask Mp.A something →
            </button>

            {/* CLOSE BUTTON */}
            <button
              className="promo-close"
              onClick={closePopup}
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KwayPromoPopup;