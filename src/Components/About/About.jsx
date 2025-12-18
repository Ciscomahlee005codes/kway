import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageContext";
import KwayLogo from "../../assets/kway-logo2.jpg";
import "./About.css";

const About = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="about-container">
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate("/settings")}>
        <FaArrowLeft className="back-icon" /> {t("back")}
      </div>

      <div className="about-header">
        <img src={KwayLogo} alt={t("aboutAppName")} className="about-logo" />
        <h2>{t("aboutAppName")}</h2>
        <p className="version">{t("aboutVersion")}</p>
      </div>

      <div className="about-section">
        <h3>{t("aboutTitle")}</h3>
        <p>{t("aboutDescription")}</p>
      </div>

      <div className="about-section">
        <h3>{t("missionTitle")}</h3>
        <p>{t("missionDescription")}</p>
      </div>

      <div className="about-section">
        <h3>{t("developerTitle")}</h3>
        <p>{t("developerDescription")}</p>
      </div>

      <div className="social-links">
        <a
          href="https://github.com/Ciscomahlee005codes"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>

        <a
          href="https://www.linkedin.com/in/chinemerem-anthony-16b4a4267/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>

        <a
          href="http://nemerem-portfolio.vercel.app/"
          target="_blank"
          rel="noreferrer"
        >
          Portfolio Website
        </a>

        <a href="mailto:ciscomahlee@gmail.com">Email</a>
      </div>

      <p className="footer-text">{t("footerRights")}</p>
    </div>
  );
};

export default About;
