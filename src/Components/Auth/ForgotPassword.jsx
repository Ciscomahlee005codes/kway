import React, { useState } from "react";
import { Link } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import toast from "react-hot-toast";

import KwayLogo from "../../assets/kway-logo-1.png";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!phone) {
      toast.error("Phone number is required");
      return;
    }

    setIsLoading(true);

    // For now just simulate
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Reset link sent (UI demo)");
    }, 1200);
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <div className="forgot-logo">
          <img src={KwayLogo} alt="Kway Logo" />
        </div>

        <h2>Forgot Password 🔐</h2>
        <p className="forgot-subtitle">
          Enter your registered phone number and we’ll help you reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <PhoneInput
            country="ng"
            value={phone}
            onChange={(value) => setPhone(value)}
            countryCodeEditable={false}
            enableAreaCodes={true}
            inputProps={{ name: "phone", required: true }}
            containerClass="phone-container"
            inputClass="phone-input"
          />

          <button
            type="submit"
            className="forgot-btn"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>

        <p className="back-login">
          Remember your password?{" "}
          <Link to="/">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
