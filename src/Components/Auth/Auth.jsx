import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { IoEye, IoEyeOff } from "react-icons/io5";

import KwayLogo from "../../assets/kway-logo-1.png";
import "./Auth.css";
import { UserAuth } from "../../Context/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const { session, sendLoginOtp, sendSignupOtp } = UserAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ================= AUTO REDIRECT IF LOGGED IN =================
  useEffect(() => {
    if (session?.user) {
      // Check if profile exists
      (async () => {
        try {
          const { data: profile } = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/profiles/${session.user.id}`
          ).then((res) => res.json());

          if (!profile) navigate("/profile-setup");
          else navigate("/chat");
        } catch (err) {
          console.error("Profile check error:", err);
        }
      })();
    }
  }, [session]);

  const toggleForm = () => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setIsLogin((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= PASSWORD STRENGTH =================
  const passwordStrength = useMemo(() => {
    const { password } = formData;
    if (!password) return "";
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (strongRegex.test(password)) return "strong";
    if (password.length >= 6) return "medium";
    return "weak";
  }, [formData.password]);

  // ================= VALIDATION =================
  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;
    if (!email) {
      toast.error("Email is required");
      return false;
    }
    if (!isLogin) {
      if (!name) {
        toast.error("Full name is required");
        return false;
      }
      if (passwordStrength !== "strong") {
        toast.error(
          "Password must contain uppercase, lowercase, number & special character (8+ chars)"
        );
        return false;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }
    return true;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const { name, email } = formData;

    try {
      if (isLogin) {
        // 🔥 LOGIN → Magic Link
        const result = await sendLoginOtp(email);
        if (result?.success) {
          navigate("/check-email", { state: { email } });
        }
      } else {
        // 🔥 SIGNUP → Magic Link
        const result = await sendSignupOtp(email);
        if (result?.success) {
          localStorage.setItem("kway_temp_name", name);
          navigate("/check-email", { state: { email } });
        }
      }
    } catch (error) {
      toast.error(error.message || "Unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-banner">
        <div className="banner-content">
          <div className="logo-circle">
            <img src={KwayLogo} alt="Kway Logo" className="logo-img" />
          </div>
          <h1>Kway</h1>
          <p>Secure login with email verification 🔐</p>
        </div>
      </div>

      <div className="auth-card">
        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "login" : "signup"}
            className="form-box"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
          >
            <h2>{isLogin ? "Welcome Back 👋" : "Create Account 📝"}</h2>

            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {!isLogin && (
              <>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                  </span>
                </div>

                {formData.password && (
                  <div className={`password-strength ${passwordStrength}`}>
                    {passwordStrength === "weak" && "Weak password ❌"}
                    {passwordStrength === "medium" && "Medium strength ⚠️"}
                    {passwordStrength === "strong" && "Strong password ✅"}
                  </div>
                )}

                <div className="password-field">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
                  </span>
                </div>
              </>
            )}

            {isLogin && (
              <div className="forgot-password">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading
                ? isLogin
                  ? "Sending Magic Link..."
                  : "Creating Account..."
                : isLogin
                ? "Continue with Email"
                : "Create Account"}
            </button>

            <p className="switch-text">
              {isLogin ? "New here?" : "Already have an account?"}{" "}
              <span onClick={toggleForm}>
                {isLogin ? "Create an account" : "Login"}
              </span>
            </p>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;
