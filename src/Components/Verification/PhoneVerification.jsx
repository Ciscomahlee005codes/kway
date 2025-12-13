import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "./PhoneVerification.css";

const PhoneVerification = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Default OTP for testing
  const DEFAULT_TEST_OTP = "123456";

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendActive(true);
    }
  }, [timer]);

   const handleChange = (value, index) => {
  if (!/^[0-9]?$/.test(value)) return;

  const newCode = [...code];
  newCode[index] = value;
  setCode(newCode);

  // Auto-focus next
  if (value && index < 5) {
    document.getElementById(`otp-${index + 1}`).focus();
  }
};
 // Auto-submit when code reaches 6 digits
useEffect(() => {
  const fullCode = code.join("");

  if (fullCode.length === 6) {
    setTimeout(() => handleVerify(), 200);
  }
}, [code]);


  const handleVerify = () => {
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      setShake(true);
      setToast({ type: "error", msg: "Please enter all 6 digits." });
      setTimeout(() => setShake(false), 600);
      return;
    }

    // Show loading
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      // Check against default OTP
      if (fullCode !== DEFAULT_TEST_OTP) {
        setShake(true);
        setToast({ type: "error", msg: "Invalid code. Try again." });
        setTimeout(() => setShake(false), 600);
      } else {
        setToast({ type: "success", msg: "Verified successfully!" });

        // Navigate to profile setup (demo)
        setTimeout(() => navigate("/profile-setup"), 1200);
      }
    }, 1200);
  };

  const handleResend = () => {
    if (!isResendActive) return;

    setCode(["", "", "", "", "", ""]);
    setTimer(60);
    setIsResendActive(false);
    setToast({ type: "success", msg: "Verification code resent!" });
  };

  return (
    <div className="verify-container">
      <div className={`verify-card ${shake ? "shake" : ""}`}>
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <IoChevronBack className="back-icon" />

          <h2>Verify Your Number</h2>
          <p className="verify-sub">Enter the 6-digit OTP code (Test: 123456)</p>

          <div className="otp-box">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                className="otp-input"
              />
            ))}
          </div>

          <button className="verify-btn" onClick={handleVerify} disabled={loading}>
            {loading ? <div className="spinner"></div> : "Verify"}
          </button>

          <p className="resend">
            {isResendActive ? (
              <span onClick={handleResend}>Resend Code</span>
            ) : (
              <>Resend in {timer}s</>
            )}
          </p>
        </motion.div>
      </div>

      {/* TOASTER */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
};

export default PhoneVerification;
