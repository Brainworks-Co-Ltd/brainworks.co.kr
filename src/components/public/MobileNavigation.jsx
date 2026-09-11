import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";

// ui/button.jsx의 buttonVariants({variant:"outline",size:"icon"}) + cn()(twMerge) 결과와
// 동일한, 이미 충돌 해소된 클래스 문자열이다. button.jsx에서 직접 import하지 않는 이유:
// 그 파일은 Button(@base-ui/react/button)도 함께 export하고 있어서, 동적 로드되는
// MobileNavigationDialog/dialog.jsx가 Button을 계속 쓰는 한 buttonVariants만 import해도
// 번들러가 모듈 전체(=base-ui 포함)를 이 정적 트리거 청크에 끌고 들어온다(검증 완료).
// button.jsx의 outline/icon 변형이 바뀌면 이 문자열도 함께 갱신해야 한다.
const TRIGGER_BUTTON_CLASSNAME =
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
