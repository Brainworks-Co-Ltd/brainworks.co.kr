import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/shared/routing/useLocale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function MobileNavigationDialog({
  items,
  open,
  onOpenChange,
  activeGroup,
  routeKey,
  navigationLabel,
  languageLabel,
  onLanguageChange,
  finalFocusRef,
}) {
  const [openGroup, setOpenGroup] = useState(null);
  const { language } = useLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        finalFocus={finalFocusRef}
        className="inset-y-0 left-auto right-0 top-0 h-dvh max-w-sm translate-x-0 translate-y-0 content-start rounded-none p-6"
        closeLabel={language === "ko" ? "닫기" : "Close"}
      >
        <DialogHeader>
          <DialogTitle>{navigationLabel}</DialogTitle>
        </DialogHeader>
        <nav aria-label={navigationLabel}>
          <ul className="divide-y divide-[var(--bw-color-line)]">
            {items.map((item) =>
              item.type === "link" ? (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={activeGroup === item.id ? "page" : undefined}
                    onClick={() => onOpenChange(false)}
                    className="block py-4 font-semibold text-[var(--bw-color-ink)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-expanded={openGroup === item.id}
                    aria-controls={`mobile-nav-${item.id}`}
                    data-current={activeGroup === item.id ? "true" : undefined}
                    onClick={() =>
                      setOpenGroup((current) =>
                        current === item.id ? null : item.id,
                      )
                    }
                    className="flex min-h-12 w-full items-center justify-between py-4 font-semibold text-[var(--bw-color-ink)]"
                  >
                    {item.label}
                    <ChevronDown
                      aria-hidden="true"
                      className={`size-4 transition-transform ${openGroup === item.id ? "rotate-180" : ""}`}
                    />
                  </button>
                  <ul
                    id={`mobile-nav-${item.id}`}
                    hidden={openGroup !== item.id}
                    className="pb-4"
                  >
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href}
                          aria-current={
                            child.activeRouteKeys.includes(routeKey)
                              ? "page"
                              : undefined
                          }
                          onClick={() => onOpenChange(false)}
                          className="block py-3 text-sm text-[var(--bw-color-muted)]"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ),
            )}
          </ul>
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={onLanguageChange}
          >
            {languageLabel}
          </Button>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
