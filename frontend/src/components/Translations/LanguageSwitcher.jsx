import React from "react";
import { useTranslation } from "../../context/TranslationContext";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useTranslation();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => setLanguage("en")} disabled={language === "en"}>English</button>
      <button onClick={() => setLanguage("bn")} disabled={language === "bn"}>Bangla</button>
    </div>
  );
};

export default LanguageSwitcher;