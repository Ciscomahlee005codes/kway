import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import KwayLogo from "../../assets/kway-logo-1.png";
import "./Auth.css";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const navigate = useNavigate();

  const toggleForm = () => {
    setFormData({ name: "", phone: "", password: "" });
    setIsLogin(!isLogin);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setShowDevModal(true);
  };

  const handleGotIt = () => {
    setShowDevModal(false);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigate("/phonenumber/verification");
    }, 800);
  };

  return (
    <div className="auth-container">
      {/* LEFT BANNER */}
      <div className="auth-banner">
        <div className="banner-content">
          <div className="logo-circle">
            <img src={KwayLogo} alt="Kway Logo" className="logo-img" />
          </div>
          <h1>Kway!!!</h1>
          <p>
            Stay connected with your friends and loved ones — anytime, anywhere 💬
          </p>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="auth-card">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login"
              className="form-box"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
            >
              <h2>Welcome Back 👋</h2>
              <p className="subtitle">Login to continue chatting</p>

              {/* PHONE INPUT */}
              <PhoneInput
  country="ng"
  value={formData.phone}
  onChange={(value) =>
    setFormData((prev) => ({ ...prev, phone: value }))
  }
  countryCodeEditable={false}
  enableAreaCodes={true}
  inputProps={{
    name: "phone",
    required: true,
  }}
  containerClass="phone-container"
  inputClass="phone-input"
/>


              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                className="login-btn"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <p className="switch-text">
                New here? <span onClick={toggleForm}>Create an account</span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              className="form-box"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
            >
              <h2>Create Account 📝</h2>
              <p className="subtitle">Join the chat community</p>

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />

              {/* PHONE INPUT */}
              <PhoneInput
  country="ng"
  value={formData.phone}
  onChange={(value) =>
    setFormData((prev) => ({ ...prev, phone: value }))
  }
  countryCodeEditable={false}
  enableAreaCodes={true}
  inputProps={{
    name: "phone",
    required: true,
  }}
  containerClass="phone-container"
  inputClass="phone-input"
/>


              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                className="login-btn"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Sign Up"}
              </button>

              <p className="switch-text">
                Already have an account? <span onClick={toggleForm}>Login</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DEV MODAL */}
      {showDevModal && (
        <div className="modal-overlay" onClick={handleGotIt}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>🚧 Under Development!</h3>
            <p>
              Kway Messenger is still under development. You can’t chat yet 😅
            </p>
            <button className="close-btn" onClick={handleGotIt}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
