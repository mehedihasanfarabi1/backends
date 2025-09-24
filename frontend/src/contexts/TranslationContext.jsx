import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { getSavedLang, saveLang } from "../utils/languageHelper";

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(getSavedLang() || "en");

  const API_URL = "http://localhost:8001/api/translations/";

  // fetch all translations from DB
  const fetchAllTranslations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      const data = {};
      res.data.forEach((t) => {
        data[t.id] = t;
      });
      setTranslations(data);
    } catch (err) {
      console.error("Fetch translations failed", err);
    } finally {
      setLoading(false);
    }
  };

  const t = (key) => {
  const item = Object.values(translations).find(t => t.key === key);
  if (!item) return key;
  return lang === "en" ? item.english : item.bangla;
};


  const fetchTranslationById = async (id) => {
    const res = await axios.get(`${API_URL}${id}/`);
    return res.data;
  };

  const addTranslation = async (payload) => {
    const res = await axios.post(API_URL, payload);
    setTranslations((prev) => ({ ...prev, [res.data.id]: res.data }));
  };

  const editTranslation = async (id, payload) => {
    const res = await axios.put(`${API_URL}${id}/`, payload);
    setTranslations((prev) => ({ ...prev, [id]: res.data }));
  };

  const deleteTranslation = async (id) => {
    await axios.delete(`${API_URL}${id}/`);
    setTranslations((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // handle language change
  const changeLanguage = (newLang) => {
    setLang(newLang);
    saveLang(newLang);
  };

  useEffect(() => {
    fetchAllTranslations();
  }, []);

  return (
    <TranslationContext.Provider
      value={{
        translations,
        loading,
        lang,
        t,
        changeLanguage,
        fetchTranslationById,
        addTranslation,
        editTranslation,
        deleteTranslation,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
