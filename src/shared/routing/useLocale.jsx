import { useContext } from "react";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";

export function useLocale() {
  const router = useContext(RouterContext);
  const language = router?.locale === "en" ? "en" : "ko";

  return { language };
}
