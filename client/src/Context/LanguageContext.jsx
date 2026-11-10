import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translations } from "../../Translations/index.js";

const LanguageContext = createContext();

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("kway-language");
  return savedLanguage && translations[savedLanguage] ? savedLanguage : "en";
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem("kway-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const t = useCallback(
    (key) => translations[language]?.[key] || translations.en[key] || key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
