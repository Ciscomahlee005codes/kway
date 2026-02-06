import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { IoEye, IoEyeOff } from "react-icons/io5";

import KwayLogo from "../../assets/kway-logo-1.png";
import "./Auth.css";
import { UserAuth } from "../../Context/AuthContext";
import { supabase } from "../../supabase";

const Auth = () => {
  const navigate = useNavigate();
  const { session, signIn, signUp, loading } = UserAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ==========================================
  // 🔥 AUTO REDIRECT AFTER EMAIL CONFIRMATION
  // ==========================================
//   useEffect(() => {
//   if (!session?.user) return;

//   const checkProfile = async () => {
//     const { data } = await supabase
//       .from("profiles")
//       .select("id")
//       .eq("id", session.user.id)
//       .maybeSingle();

//     const currentPath = window.location.pathname;

//     if (!data && currentPath !== "/profile-setup") {
//       navigate("/profile-setup", { replace: true });
//     }

//     if (data && currentPath !== "/chat") {
//       navigate("/chat", { replace: true });
//     }
//   };

//   checkProfile();
// }, [session, navigate]);


  // ==========================================
  // 🔐 PASSWORD STRENGTH
  // ==========================================
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (!password) return "";

    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (strong.test(password)) return "strong";
    if (password.length >= 6) return "medium";
    return "weak";
  }, [formData.password]);

  const toggleForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setIsLogin((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // ✅ VALIDATION
  // ==========================================
  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!email) {
      toast.error("Email is required");
      return false;
    }

    if (!password) {
      toast.error("Password is required");
      return false;
    }

    if (!isLogin) {
      if (!name) {
        toast.error("Full name is required");
        return false;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }

    return true;
  };

  // ==========================================
  // 🚀 SUBMIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const { email, password } = formData;

    try {
      if (isLogin) {
        // ===== LOGIN =====
        const result = await signIn(email, password);
        if (!result.success) return;
          navigate("/profile-setup");
      } else {
        // ===== SIGN UP =====
        const result = await signUp(email, password);
        if (!result.success) return;

        // Save email for display
        setRegisteredEmail(email);

        // Clear form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

        // Show email confirmation screen
        setShowEmailSent(true);
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  // ==========================================
  // 📩 EMAIL SENT SCREEN
  // ==========================================
   if (showEmailSent) {
  return (
    <div className="auth-container email-screen">
      <div className="auth-card email-sent-card">
        <div className="email-icon">📩</div>

        <h2>Check Your Email</h2>

        <p className="email-text">
          We sent a confirmation link to
        </p>

        <p className="email-address">{registeredEmail}</p>

        <p className="email-sub">
          Please verify your email to continue.
        </p>

        <button
          className="login-btn"
          onClick={() => {
            setShowEmailSent(false);
            setIsLogin(true);
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}


  // ==========================================
  // 🧾 NORMAL AUTH FORM
  // ==========================================
  return (
    <div className="auth-container">
      <div className="auth-banner">
        <div className="banner-content">
          <div className="logo-circle">
            <img src={KwayLogo} alt="Kway Logo" className="logo-img" />
          </div>
          <h1>Kway</h1>
          <p>Secure messaging starts here 🔐</p>
        </div>
      </div>

      <div className="auth-card">
        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "login" : "signup"}
            className="form-box"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2>
              {isLogin ? "Welcome Back 👋" : "Create Your Account 🚀"}
            </h2>

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

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={
                  isLogin ? "Enter Password" : "Create Password"
                }
                value={formData.password}
                onChange={handleChange}
              />
              <span
                className="toggle-password"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>

            {!isLogin && formData.password && (
              <div className={`password-strength ${passwordStrength}`}>
                {passwordStrength === "weak" && "Weak password"}
                {passwordStrength === "medium" && "Medium strength"}
                {passwordStrength === "strong" && "Strong password"}
              </div>
            )}

            {!isLogin && (
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
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                >
                  {showConfirmPassword ? (
                    <IoEyeOff />
                  ) : (
                    <IoEye />
                  )}
                </span>
              </div>
            )}

            {isLogin && (
              <div className="forgot-password">
                <Link to="/forgot-password">
                  Forgot Password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                ? "Login"
                : "Create Account"}
            </button>

            <p className="switch-text">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <span onClick={toggleForm}>
                {isLogin ? "Sign Up" : "Login"}
              </span>
            </p>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;
