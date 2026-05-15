import * as React from "react";
import en from "../locales/en.json";
import mr from "../locales/mr.json";
import { I18nContext, Lang } from "./i18n-context";

const LOCALES: Record<Lang, Record<string, unknown>> = {
  en,
  mr,
};

const STORAGE_KEY = "gg_lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "mr") return "mr" as Lang;
    } catch (e) {
      // localStorage may be unavailable in some environments
    }
    return "en" as Lang;
  });

  const setLang = React.useCallback((l: Lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch (e) {
      // ignore write failures
    }
    setLangState(l);
  }, []);

  const t = React.useCallback(
    (key: string) => {
      const parts = key.split(".");
      let cur: unknown = LOCALES[lang] || LOCALES.en;
      for (const p of parts) {
        if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
          cur = (cur as Record<string, unknown>)[p];
        } else return key;
      }
      return typeof cur === "string" ? (cur as string) : key;
    },
    [lang],
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export default I18nProvider;
