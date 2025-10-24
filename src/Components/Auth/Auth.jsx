import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const toggleForm = () => {
    setFormData({ name: "", phone: "", password: "" });
    setIsLogin(!isLogin);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const simulateLoading = (callback) => {
    setIsLoading(true);
    setTimeout(() => {
      callback();
      setIsLoading(false);
    }, 1200);
  };

  const handleSubmit = () => {
    simulateLoading(() => navigate("/chat"));
  };

  return (
    <div className="auth-container">
      {/* Left Side Banner */}
      <div className="auth-banner">
        <div className="banner-content">
          <div className="logo-circle">
            <img className="logo-img" src={KwayLogo} alt="" />
          </div>
          <h1>Kway!!!</h1>
          <p>Stay connected with your friends and loved ones — anytime, anywhere 💬</p>
          <img src="/chat-banner.png" alt="Chat illustration" className="banner-img" />
        </div>
      </div>

      {/* Right Side Form */}
      <div className="auth-card">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
              className="form-box"
            >
              <h2>Welcome Back to Kway 👋</h2>
              <p className="subtitle">Login to continue chatting</p>

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />

              <button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <p className="switch-text">
                New here? <span onClick={toggleForm}>Create an account</span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
              className="form-box"
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
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />

              <button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Creating..." : "Sign Up"}
              </button>

              <p className="switch-text">
                Already have an account? <span onClick={toggleForm}>Login</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;
