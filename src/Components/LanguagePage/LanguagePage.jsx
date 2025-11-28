import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { FaLanguage, FaArrowLeft } from "react-icons/fa"; // ✅ Add back icon
import "./LanguagePage.css";

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese" },
  { code: "yo", label: "Yoruba" },
  { code: "ig", label: "Igbo" },
  { code: "ha", label: "Hausa" }
];

const LanguagePage = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem("kway-language") || "en";
  });

  const selectLanguage = (code) => {
    setSelectedLang(code);
    localStorage.setItem("kway-language", code);
  };

  return (
    <div className="language-container fade-in">
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate("/settings")}>
        <FaArrowLeft className="back-icon" /> Back
      </div>

      <h2 className="language-title slide-down">
        <FaLanguage className="title-icon" /> Language
      </h2>

      <div className="language-list">
        {languages.map((lang, index) => (
          <div
            key={index}
            className={`language-item pop-in ${
              selectedLang === lang.code ? "active" : ""
            }`}
            onClick={() => selectLanguage(lang.code)}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <span>{lang.label}</span>

            {selectedLang === lang.code && (
              <span className="selected-dot"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguagePage;
