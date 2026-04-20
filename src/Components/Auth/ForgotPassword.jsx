import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../../supabase";

import KwayLogo from "../../assets/kway-logo-1.png";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Reset link sent to your email 📩");
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <div className="forgot-logo">
          <img src={KwayLogo} alt="Kway Logo" />
        </div>

        <h2>Forgot Password 🔐</h2>
        <p className="forgot-subtitle">
          Enter your registered email to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="forgot-input"
          />

          <button
            type="submit"
            className="forgot-btn"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="back-login">
          Remember your password? <Link to="/">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;