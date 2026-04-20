import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaLanguage, FaArrowLeft } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageContext";
import "./LanguagePage.css";

const languages = [
  { code: "en", label: "English" },
  { code: "pcm", label: "Pidgin English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese" },
  { code: "yo", label: "Yoruba" },
  { code: "ig", label: "Igbo" },
  { code: "ha", label: "Hausa" },
];

const LanguagePage = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  // ✅ Ensure English is default
  useEffect(() => {
    if (!language) {
      setLanguage("en");
    }
  }, [language, setLanguage]);

  const selectLanguage = (code) => {
    setLanguage(code);
  };

  return (
    <div className="language-container fade-in">
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate("/settings")}>
        <FaArrowLeft className="back-icon" /> {t("back")}
      </div>

      <h2 className="language-title slide-down">
        <FaLanguage className="title-icon" /> {t("language")}
      </h2>

      <div className="language-list">
        {languages.map((lang, index) => (
          <div
            key={lang.code}
            className={`language-item pop-in ${
              language === lang.code ? "active" : ""
            }`}
            onClick={() => selectLanguage(lang.code)}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <span>{lang.label}</span>

            {language === lang.code && (
              <span className="selected-dot"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguagePage;
