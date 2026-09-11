import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

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
        className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
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
