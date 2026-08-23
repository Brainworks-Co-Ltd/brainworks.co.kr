import { useRouter } from "next/router";

export function useLocale() {
  const router = useRouter();
  const language = router.locale === "en" ? "en" : "ko";

  return { language };
}
