import * as React from "react";
import { I18nContext } from "./i18n-context";

export const useI18n = () => React.useContext(I18nContext);

export const useT = () => {
  const ctx = React.useContext(I18nContext);
  return ctx.t;
};

export default useI18n;
