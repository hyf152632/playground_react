import { createI18nProvider } from "./utils/i18n";
import en from "./utils/i18n/sources/en.json";
import zh from "./utils/i18n/sources/zh.json";

export default createI18nProvider({ lng: "en", resources: { en, zh } });
