import { useCallback, useEffect } from "react";

export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  return useCallback(() => {
    if (!dirty) return true;
    return window.confirm(
      "저장하지 않은 변경사항이 있습니다. 이 화면에서 나가시겠습니까?",
    );
  }, [dirty]);
}
