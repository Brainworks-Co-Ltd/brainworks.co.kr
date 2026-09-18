import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { DesktopNavigation } from "@/components/public/DesktopNavigation";
import { MobileNavigation } from "@/components/public/MobileNavigation";
import {
  buildPublicNavigation,
  getActiveNavigationGroup,
} from "@/shared/navigation/publicNavigation";
import {
  getLocaleSwitchPath,
  getLocalizedPath,
  getRouteKey,
} from "@/shared/routing/routes";
import { useLocale } from "@/shared/routing/useLocale";

export default function Header() {
  const router = useRouter();
  const { language } = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 아래로 스크롤하면 헤더를 숨기고 위로 올리면 보인다. 메뉴가 열려 있거나 헤더 안에 초점이 있으면 숨기지 않는다.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const el = headerRef.current;
      const busy =
        el?.contains(document.activeElement) ||
        el?.querySelector('[aria-expanded="true"]');
      setIsHidden(!busy && y > 100 && y > last);
      setIsScrolled(y > 10);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const targetLocale = language === "ko" ? "en" : "ko";
  const routeKey = getRouteKey(router.asPath);
  const items = buildPublicNavigation(language);
  const activeGroup = getActiveNavigationGroup(routeKey);

  const toggleLanguage = () => {
    void router.push(
      getLocaleSwitchPath(router.asPath, targetLocale),
      undefined,
      {
        locale: targetLocale,
      },
    );
  };

  return (
    <header
      ref={headerRef}
      data-hidden={isHidden || undefined}
      data-scrolled={isScrolled ? "true" : undefined}
      onFocus={() => setIsHidden(false)}
      className="bw-header fixed inset-x-0 top-0 z-50 border-b border-transparent bg-white/90 backdrop-blur transition-colors data-[scrolled=true]:border-line data-[scrolled=true]:shadow-[0_1px_0_rgba(0,0,0,.04)]"
    >
      <div className="inner flex h-20 items-center justify-between gap-10">
        <Link
          href={getLocalizedPath("home", language)}
          className="flex items-center gap-3"
          aria-label={language === "ko" ? "브레인웍스 홈" : "Brainworks home"}
        >
          <Image
            src="/images/회사로고.png"
            alt=""
            width={270}
            height={86}
            priority
            className="bw-header__logo h-11 w-auto"
          />
          <span className="sr-only">Brainworks</span>
        </Link>

        <div className="hidden lg:block">
          <DesktopNavigation
            items={items}
            activeGroup={activeGroup}
            routeKey={routeKey}
            navigationLabel={
              language === "ko" ? "주요 메뉴" : "Primary navigation"
            }
          />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={getLocalizedPath("contact", language)}
            className="pill pill-dark h-10 px-6 text-[15px] max-lg:hidden!"
          >
            {language === "ko" ? "문의하기" : "Contact"}
          </Link>
          <button
            type="button"
            onClick={toggleLanguage}
            className="hidden rounded-full border border-line px-3 py-3.5 text-xs font-semibold text-ink-strong transition hover:border-ink-strong lg:inline-flex"
          >
            {language === "ko" ? "EN" : "KO"}
          </button>
          <div className="lg:hidden">
            <MobileNavigation
              items={items}
              open={isMenuOpen}
              onOpenChange={setIsMenuOpen}
              activeGroup={activeGroup}
              routeKey={routeKey}
              menuLabel={language === "ko" ? "메뉴 열기" : "Open menu"}
              navigationLabel={
                language === "ko" ? "모바일 메뉴" : "Mobile navigation"
              }
              languageLabel={language === "ko" ? "English" : "한국어"}
              onLanguageChange={toggleLanguage}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
