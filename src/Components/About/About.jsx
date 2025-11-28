import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { FaArrowLeft } from "react-icons/fa"; // ✅ Back icon
import KwayLogo from "../../assets/kway-logo2.jpg";
import "./About.css";

const About = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate

  return (
    <div className="about-container">
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate("/settings")}>
        <FaArrowLeft className="back-icon" /> Back
      </div>

      <div className="about-header">
        <img src={KwayLogo} alt="Kway Logo" className="about-logo" />
        <h2>Kway Messenger</h2>
        <p className="version">Version 1.0.0</p>
      </div>

      <div className="about-section">
        <h3>About Kway</h3>
        <p>
          Kway is a modern messaging platform designed for fast, smooth and 
          secure communication. Inspired by WhatsApp’s simplicity, Kway 
          aims to introduce advanced features like AI-assisted messaging, 
          multi-device sync, smart media handling, and a cleaner user experience.
        </p>
      </div>

      <div className="about-section">
        <h3>Mission</h3>
        <p>
          Our mission is to build a seamless digital communication ecosystem that 
          connects people effortlessly while prioritizing privacy, speed, and innovation.
        </p>
      </div>

      <div className="about-section">
        <h3>Developer</h3>
        <p>
          Built with ❤️ by <strong>Anthony Chinemerem Raphael (Cisco Mahlee)</strong>  
          <br />Full Stack Developer & Founder of Kway.
        </p>
      </div>

      <div className="social-links">
        <a href="https://github.com/Ciscomahlee005codes" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="https://www.linkedin.com/in/chinemerem-anthony-16b4a4267/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href="http://nemerem-portfolio.vercel.app/" target="_blank" rel="noreferrer">
          Portfolio Website
        </a>
        <a href="mailto:ciscomahlee@gmail.com">Email</a>
      </div>

      <p className="footer-text">© 2025 KWay Technologies. All rights reserved.</p>
    </div>
  );
};

export default About;
