import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import PopupNoticeRegion, {
  nextPopup,
} from "@/components/popup-notices/PopupNoticeRegion";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const notices = [
  {
    id: "a",
    title: "첫 번째 공지",
    bodyMarkdown: "본문 A",
    dismissalRevision: 1,
    displayOrder: 0,
    imageUrl: null,
    imageAlt: null,
    detailUrl: null,
  },
  {
    id: "b",
    title: "두 번째 공지",
    bodyMarkdown: null,
    dismissalRevision: 1,
    displayOrder: 1,
    imageUrl: null,
    imageAlt: null,
    detailUrl: "/notices/7",
  },
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

  it("한 번에 하나만 카드로 띄우고, 닫으면 다음 건이 뜬다", async () => {
    render(<PopupNoticeRegion notices={notices} />);

    const region = await screen.findByRole("region", { name: "팝업 공지" });
    expect(region).toHaveTextContent("첫 번째 공지");
    expect(screen.queryByText("두 번째 공지")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    await waitFor(() =>
      expect(
        screen.getByRole("region", { name: "팝업 공지" }),
      ).toHaveTextContent("두 번째 공지"),
    );
    expect(window.sessionStorage.getItem("brainworks:popup:session:a:1")).toBe(
      "1",
    );
    expect(window.localStorage.getItem("brainworks:popup:day:a")).toBeNull();

    expect(screen.getByRole("link", { name: "자세히 보기" })).toHaveAttribute(
      "href",
      "/notices/7",
    );

    fireEvent.click(
      screen.getByRole("checkbox", { name: "오늘 하루 다시 보지 않기" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    await waitFor(() =>
      expect(screen.queryByRole("region")).not.toBeInTheDocument(),
    );
    expect(window.localStorage.getItem("brainworks:popup:day:b")).toContain(
      '"revision":1',
    );
  });

  it("이미 제외된 건은 건너뛴다", async () => {
    window.sessionStorage.setItem("brainworks:popup:session:a:1", "1");
    render(<PopupNoticeRegion notices={notices} />);
    expect(
      await screen.findByRole("region", { name: "팝업 공지" }),
    ).toHaveTextContent("두 번째 공지");
  });

  it("체크박스를 켠 채 닫으면 오늘 하루 제외, 끈 채 닫으면 세션만 제외한다", async () => {
    const { unmount } = render(<PopupNoticeRegion notices={[notices[0]]} />);
    await screen.findByRole("region", { name: "팝업 공지" });

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(window.localStorage.getItem("brainworks:popup:day:a")).toBeNull();
    expect(window.sessionStorage.getItem("brainworks:popup:session:a:1")).toBe(
      "1",
    );
    unmount();

    window.sessionStorage.clear();
    render(<PopupNoticeRegion notices={[notices[0]]} />);
    await screen.findByRole("region", { name: "팝업 공지" });

    fireEvent.click(
      screen.getByRole("checkbox", { name: "오늘 하루 다시 보지 않기" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(window.localStorage.getItem("brainworks:popup:day:a")).toContain(
      '"revision":1',
    );
  });
});
