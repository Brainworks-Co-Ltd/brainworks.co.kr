import { useState, useSyncExternalStore } from "react";
import { Pause, RotateCcw } from "lucide-react";
import { useLocale } from "@/shared/routing/useLocale";

const QUERY = "(prefers-reduced-motion: reduce)";
const serverSnapshot = () => false;
const motionSnapshot = () => window.matchMedia?.(QUERY).matches ?? false;
const visibilitySnapshot = () => document.hidden;

function subscribeMotion(callback) {
  const media = window.matchMedia?.(QUERY);
  media?.addEventListener("change", callback);
  return () => media?.removeEventListener("change", callback);
}

function subscribeVisibility(callback) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

// 장면의 빛만 제어한다. 문구·산업 선택은 시간에 따라 바뀌지 않는다.
export function useGraphicMotion() {
  const reduced = useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    serverSnapshot,
  );
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    visibilitySnapshot,
    serverSnapshot,
  );
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [run, setRun] = useState(0);

  return {
    run,
    reduced,
    paused: paused || reduced || hidden || finished,
    stopped: paused || finished,
    finish(event) {
      if (event.animationName === "bw-hero-sweep") setFinished(true);
    },
    restart() {
      // 다른 현장을 선택해도 사용자가 정지한 설정은 유지한다.
      setFinished(false);
      setRun((value) => value + 1);
    },
    toggle() {
      if (reduced) return;
      if (paused || finished) {
        setRun((value) => value + 1);
        setFinished(false);
        setPaused(false);
      } else {
        setPaused(true);
      }
    },
  };
}

export function GraphicMotionControl({ motion }) {
  const { language } = useLocale();
  const ko = language === "ko";
  const label = motion.reduced
    ? ko
      ? "동작 줄이기 적용 중"
      : "Reduced motion enabled"
    : motion.stopped
      ? ko
        ? "움직임 다시 보기"
        : "Replay motion"
      : ko
        ? "움직임 정지"
        : "Pause motion";
  const Icon = motion.stopped || motion.reduced ? RotateCcw : Pause;

  return (
    <button
      className="bw-motion-control"
      type="button"
      onClick={motion.toggle}
      disabled={motion.reduced}
    >
      <Icon size={14} aria-hidden="true" />
      {label}
    </button>
  );
}
