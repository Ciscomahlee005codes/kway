import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import KwayLogo from "../../assets/kway-logo-1.png";
import "./AdminAuth.css";

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "" 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const navigate = useNavigate();

  const toggleForm = () => {
    setFormData({ name: "", email: "", password: "" });
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
      navigate("/admin/home");
    }, 900);
  };

  return (
    <div className="admin-auth-container">
      {/* Left Admin Banner */}
      <div className="admin-auth-banner">
        <div className="banner-content">
          <div className="admin-logo-circle">
           <img className="admin-logo-icon" src={KwayLogo} alt="Logo" />
          </div>

          <h1>Admin Portal</h1>
          <p>Manage users, monitor chats, and control your entire system securely.</p>

          <img 
            src="/admin-secure.png" 
            alt="Admin illustration" 
            className="banner-img" 
          />
        </div>
      </div>

      {/* Right Auth Card */}
      <div className="admin-auth-card">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
              className="form-box"
            >
              <h2>Welcome Admin 👋</h2>
              <p className="subtitle">Login to access the dashboard</p>

              <input
                type="text"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Admin Password"
                value={formData.password}
                onChange={handleChange}
              />

              <button 
                onClick={handleSubmit} 
                disabled={isLoading} 
                className="admin-login-btn"
              >
                {isLoading ? "Verifying..." : "Login"}
              </button>

              <p className="switch-text">
                New Admin? <span onClick={toggleForm}>Create Admin</span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="admin-signup"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
              className="form-box"
            >
              <h2>Create Admin 🛠️</h2>
              <p className="subtitle">Register a new admin account</p>

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleChange}
              />

              <input
                type="password"
                name="password"
                placeholder="Admin Password"
                value={formData.password}
                onChange={handleChange}
              />

              <button 
                onClick={handleSubmit} 
                disabled={isLoading} 
                className="admin-login-btn"
              >
                {isLoading ? "Creating..." : "Create Admin"}
              </button>

              <p className="switch-text">
                Already an admin? <span onClick={toggleForm}>Login</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dev Modal */}
      {showDevModal && (
        <div className="modal-overlay" onClick={handleGotIt}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>🔧 Admin System in Progress</h3>
            <p>
              This Admin Portal is still being developed.  
              Dashboard access will be available soon!
            </p>

            <button className="close-btn" onClick={handleGotIt}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuth;
