import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationsEN from "./en/en.json";
import translationsHE from "./he/he.json";

const resources = {
  en: {
    translation: translationsEN,
  },
  he: {
    translation: translationsHE,
  },
};

i18n.use(initReactI18next).init({
  resources,
  supportedLngs: ["he", "en", "en-GB"],
  fallbackLng: "en",
  lng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
