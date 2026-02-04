import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./en";
import da from "./da";

const resources = {
  en: { translation: en },
  da: { translation: da },
};

const languageTag = Localization.getLocales()[0]?.languageTag || "en";
const languageCode = languageTag.split("-")[0];

i18n.use(initReactI18next).init({
  resources,
  lng: languageCode === "da" ? "da" : "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
