import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import PopupNoticeRegion, {
  nextPopup,
} from "@/components/popup-notices/PopupNoticeRegion";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const notices = [
  { id: "a", title: "첫 번째 공지", bodyMarkdown: "본문 A", dismissalRevision: 1, displayOrder: 0, imageUrl: null, imageAlt: null, detailUrl: null },
  { id: "b", title: "두 번째 공지", bodyMarkdown: null, dismissalRevision: 1, displayOrder: 1, imageUrl: null, imageAlt: null, detailUrl: "/notices/7" },
];

describe("PopupNoticeRegion", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("nextPopup은 제외되지 않은 첫 건을 고른다", () => {
    expect(nextPopup(notices, new Set())?.id).toBe("a");
    expect(nextPopup(notices, new Set(["a"]))?.id).toBe("b");
    expect(nextPopup(notices, new Set(["a", "b"]))).toBeNull();
  });

  it("한 번에 하나만 모달로 띄우고, 닫으면 다음 건이 뜬다", async () => {
    render(<PopupNoticeRegion notices={notices} />);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("첫 번째 공지");
    expect(screen.queryByText("두 번째 공지")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    await waitFor(() =>
      expect(screen.getByRole("dialog")).toHaveTextContent("두 번째 공지"),
    );
    expect(screen.getByRole("link", { name: "자세히 보기" })).toHaveAttribute(
      "href",
      "/notices/7",
    );

    fireEvent.click(screen.getByRole("button", { name: "오늘 하루 보지 않기" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(window.localStorage.getItem("brainworks:popup:day:b")).toContain(
      '"revision":1',
    );
  });

  it("이미 제외된 건은 건너뛴다", async () => {
    window.sessionStorage.setItem("brainworks:popup:session:a:1", "1");
    render(<PopupNoticeRegion notices={notices} />);
    expect(await screen.findByRole("dialog")).toHaveTextContent("두 번째 공지");
  });
});
