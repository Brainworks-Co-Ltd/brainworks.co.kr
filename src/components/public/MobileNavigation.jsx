import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";

// 이 문자열은 cn(buttonVariants({ variant: "outline", size: "icon" }))와 정확히 같아야 한다.
// 공개 라우트가 cva/clsx/tailwind-merge를 정적으로 끌어오지 않도록 미리 병합해 둔 값이며,
// tests/components/mobile-navigation-trigger.test.tsx가 동일성을 검증한다.
export const TRIGGER_BUTTON_CLASSNAME =
  "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--bw-radius-control)] font-medium transition-colors duration-200 outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 border border-[var(--bw-color-ink)] bg-transparent text-[var(--bw-color-ink)] hover:bg-[var(--bw-color-surface-muted)] h-10 w-10 p-0";

const MobileNavigationDialog = dynamic(
  () =>
    import("@/components/public/MobileNavigationDialog").then(
      (m) => m.MobileNavigationDialog,
    ),
  { ssr: false },
);

export function MobileNavigation({
  items,
  open,
  onOpenChange,
  activeGroup,
  routeKey,
  menuLabel,
  navigationLabel,
  languageLabel,
  onLanguageChange,
}) {
  const triggerRef = useRef(null);
  const [hasOpened, setHasOpened] = useState(false);

  const handleOpenChange = (next) => {
    onOpenChange(next);
    if (next) {
      setHasOpened(true);
    } else {
      triggerRef.current?.focus();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={TRIGGER_BUTTON_CLASSNAME}
        aria-label={menuLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => handleOpenChange(true)}
      >
        <Menu aria-hidden="true" />
      </button>
      {(open || hasOpened) && (
        <MobileNavigationDialog
          items={items}
          open={open}
          onOpenChange={handleOpenChange}
          activeGroup={activeGroup}
          routeKey={routeKey}
          navigationLabel={navigationLabel}
          languageLabel={languageLabel}
          onLanguageChange={onLanguageChange}
        />
      )}
    </>
  );
}
