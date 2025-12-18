import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaComments,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const handleLogoutClick = (e) => {
    e.preventDefault(); // Prevent navigation
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // TODO: Add your logout function
    console.log("Logged Out!");
    setShowLogoutModal(false);

    // Example redirect:
    window.location.href = "/admin/auth";
  };

  return (
    <>
      <div className={`adminDash-sidebar ${collapsed ? "collapsed" : ""}`}>
        
        {/* Logo & Toggle */}
        <div className="adminDash-header">
          <h2 className="adminDash-logo">{!collapsed && "AdminPanel"}</h2>
          <button className="adminDash-toggleBtn" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>

        {/* Navigation */}
        <nav className="adminDash-navMenu">
          <NavLink to="/admin/home" className="adminDash-navItem">
            <FaTachometerAlt className="adminDash-navIcon" />
            <span className="adminDash-navText">Dashboard</span>
          </NavLink>

          <NavLink to="/admin/usermanagement" className="adminDash-navItem">
            <FaUsers className="adminDash-navIcon" />
            <span className="adminDash-navText">Users</span>
          </NavLink>

          <NavLink to="/admin/chatMonitor" className="adminDash-navItem">
            <FaComments className="adminDash-navIcon" />
            <span className="adminDash-navText">Chats</span>
          </NavLink>

          <NavLink to="/admin/notifications" className="adminDash-navItem">
            <FaBell className="adminDash-navIcon" />
            <span className="adminDash-navText">Notifications</span>
          </NavLink>

          <NavLink to="/admin/settings" className="adminDash-navItem">
            <FaCog className="adminDash-navIcon" />
            <span className="adminDash-navText">Settings</span>
          </NavLink>

          {/* Logout Button Trigger Modal */}
          <a
            href="#"
            className="adminDash-navItem adminDash-logout"
            onClick={handleLogoutClick}
          >
            <FaSignOutAlt className="adminDash-navIcon" />
            <span className="adminDash-navText">Logout</span>
          </a>
        </nav>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="logoutOverlay">
          <div className="logoutModal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>

            <div className="logoutButtons">
              <button className="cancelBtn" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="confirmBtn" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
