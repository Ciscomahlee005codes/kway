import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import { UserAuth } from "../../Context/AuthContext";
import "./PhoneVerification.css";

const PhoneVerification = () => {
  const [timer, setTimer] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { sendLoginOtp } = UserAuth();

  const email = location.state?.email;

  // ================= TIMER =================
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendActive(true);
    }
  }, [timer]);

  // ================= RESEND =================
  const handleResend = async () => {
    if (!isResendActive) return;

    setLoading(true);
    const result = await sendLoginOtp(email);
    setLoading(false);

    if (result?.success) {
      setTimer(60);
      setIsResendActive(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <IoChevronBack
            className="back-icon"
            onClick={() => navigate(-1)}
          />

          <h2>Check Your Email</h2>
          <p className="verify-sub">
            We have sent a magic link to <strong>{email}</strong>. 
            Click the link in your email to continue logging in.
          </p>

          <button
            className="verify-btn"
            onClick={handleResend}
            disabled={loading || !isResendActive}
          >
            {loading ? (
              <div className="loader"></div>
            ) : isResendActive ? (
              "Resend Magic Link"
            ) : (
              `Resend in ${timer}s`
            )}
          </button>

          <p className="verify-note">
            If you don’t see the email, check your spam folder.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PhoneVerification;
