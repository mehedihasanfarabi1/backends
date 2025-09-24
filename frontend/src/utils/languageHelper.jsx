export const getSavedLang = () => {
  return localStorage.getItem("lang") || "en";
};

export const saveLang = (lang) => {
  localStorage.setItem("lang", lang);
};
