/* eslint-disable react-refresh/only-export-components */
import * as React from "react";

export type Lang = "en" | "mr";

export const I18nContext = React.createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: () => "",
});

export default I18nContext;
