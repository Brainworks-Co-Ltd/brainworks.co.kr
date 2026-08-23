import type { Locale } from "./routes";
import { getLocaleSwitchPath } from "./routes";

export const publicOrigin = "https://brainworks.co.kr";

export function getCanonicalUrl(pathname: string, locale: Locale): string {
  return `${publicOrigin}${getLocaleSwitchPath(pathname, locale)}/`.replace(
    /([^:])\/\/+$/,
    "$1/",
  );
}

export function getLocaleAlternates(pathname: string) {
  return {
    ko: getCanonicalUrl(pathname, "ko"),
    en: getCanonicalUrl(pathname, "en"),
    "x-default": getCanonicalUrl(pathname, "ko"),
  };
}
