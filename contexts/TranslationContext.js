// contexts/TranslationContext.js
import { translations } from "@/utils/locales";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  // Load saved language from local storage
  useEffect(() => {
    const loadLang = async () => {
      const savedLang = await AsyncStorage.getItem("appLanguage");
      if (savedLang) setLanguage(savedLang);
    };
    loadLang();
  }, []);

  // Save language when changed
  const switchLanguage = async (lang) => {
    setLanguage(lang);
    await AsyncStorage.setItem("appLanguage", lang);
  };

  const t = (key) => translations[language][key] || key;

  return (
    <TranslationContext.Provider value={{ t, language, switchLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
