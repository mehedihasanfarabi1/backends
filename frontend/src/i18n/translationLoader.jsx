import { fetchTranslations } from "../api/translationApi";

let translations = {};

export const loadTranslations = async () => {
  const data = await fetchTranslations();
  translations = {};
  data.forEach(t => {
    translations[t.key] = {
      en: t.english,
      bn: t.bangla,
      ar: t.arabian,
    };
  });
};

export const t = (key, lang = "en") => {
  return translations[key]?.[lang] || key;
};
