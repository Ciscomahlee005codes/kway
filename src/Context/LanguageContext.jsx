import React, { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../../Translations/index";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem("kway-language") || "en"
  );

  useEffect(() => {
    localStorage.setItem("kway-language", language);
  }, [language]);

  const t = (key) =>
    translations[language]?.[key] ||
    translations.en[key] ||
    key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
