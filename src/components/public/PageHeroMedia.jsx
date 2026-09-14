import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/shared/routing/useLocale";

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener?.("change", updatePreference);

    return () => mediaQuery.removeEventListener?.("change", updatePreference);
  }, []);

  return reducedMotion;
}

function FallbackSurface({ language }) {
  return (
    <div className="flex h-full min-h-48 items-center justify-center bg-[var(--bw-color-surface-muted)] p-6 text-center text-sm text-[var(--bw-color-muted)]">
      {language === "ko" ? "미디어를 표시할 수 없습니다." : "Media unavailable."}
    </div>
  );
}

export function PageHeroMedia({ media }) {
  const { language } = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  if (!media?.src || failed || posterFailed) {
    return <FallbackSurface language={language} />;
  }

  const mediaStyle = media.objectPosition
    ? { objectPosition: media.objectPosition }
    : undefined;

  if (media.kind === "video") {
    if (reducedMotion) {
      if (!media.poster) {
        return <FallbackSurface language={language} />;
      }

      return (
        <Image
          src={media.poster}
          alt={media.alt ?? ""}
          fill
          sizes="100vw"
          priority
          style={mediaStyle}
          className="object-cover"
          onError={() => setPosterFailed(true)}
        />
      );
    }

    return (
      <video
        src={media.src}
        poster={media.poster}
        muted
        loop
        autoPlay
        playsInline
        aria-label={media.alt}
        style={mediaStyle}
        className="block h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={media.src}
      alt={media.alt ?? ""}
      fill
      sizes="100vw"
      priority
      style={mediaStyle}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
