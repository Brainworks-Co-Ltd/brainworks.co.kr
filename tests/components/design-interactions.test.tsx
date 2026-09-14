import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BusinessAreaExplorer from "@/components/services/BusinessAreaExplorer";
import IndustrialHero from "@/components/industrial/IndustrialHero";

// router.query는 useRouter()를 호출하는 컴포넌트 안에서 useState로 관리한다.
// 실제 next/router의 shallow replace처럼, replace가 호출되면 그 즉시 리렌더가
// 일어나야 BusinessAreaExplorer의 활성 탭 계산(렌더 중 파생값)이 반영된다.
const router = vi.hoisted(() => ({
  query: {} as Record<string, string>,
  pathname: "/services",
  replace: vi.fn(),
  push: vi.fn(),
}));
vi.mock("next/router", () => ({
  useRouter: () => {
    const [query, setQuery] = useState(router.query);
    router.replace.mockImplementation((url: { query?: Record<string, string> }) => {
      router.query = { ...url?.query };
      setQuery(router.query);
      return Promise.resolve(true);
    });
    return { ...router, query };
  },
}));
vi.mock("@/shared/routing/useLocale", () => ({
  useLocale: () => ({ language: "ko" }),
}));

beforeEach(() => {
  router.query = {};
  router.replace.mockClear();
  router.push.mockClear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("디자인 개선의 탐색과 제목", () => {
  it("탭 방향키를 연속해서 누르면 선택과 초점이 함께 이동하고 양끝을 순환한다", async () => {
    const user = userEvent.setup();
    render(<BusinessAreaExplorer />);
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(tabs[2]).toHaveFocus();
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{End}{ArrowRight}");
    expect(tabs[0]).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(tabs[3]).toHaveFocus();
    await user.keyboard("{Home}");
    expect(tabs[0]).toHaveFocus();
  });

  it("탭을 마우스로 클릭하면 즉시 선택 상태가 바뀐다", () => {
    render(<BusinessAreaExplorer />);
    const tabs = screen.getAllByRole("tab");
    fireEvent.click(tabs[2]);
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
  });

  it("현장 이름을 지우고 다음 현장을 타이핑하며 재생 버튼은 표시하지 않는다", () => {
    vi.useFakeTimers();
    const { container } = render(<IndustrialHero />);
    const slot = container.querySelector(".ind-slot");
    expect(slot).toHaveTextContent("제조 AI");
    act(() => vi.advanceTimersByTime(2400));
    act(() => vi.advanceTimersByTime(40));
    expect(slot).toHaveTextContent("제조 A");
    expect(slot).not.toHaveTextContent("제조 AI");
    for (let i = 0; i < 20; i += 1) act(() => vi.advanceTimersByTime(80));
    expect(slot).toHaveTextContent("헬스케어 AI");
    expect(
      screen.queryByRole("button", { name: /움직임/ }),
    ).not.toBeInTheDocument();
    fireEvent.focus(screen.getByRole("button", { name: /스마트시티 AI/ }));
    fireEvent.click(screen.getByRole("button", { name: /스마트시티 AI/ }));
    act(() => vi.advanceTimersByTime(10000));
    expect(slot).toHaveTextContent("스마트시티 AI");
  });

  it("동작 줄이기를 사용하면 완성된 현장 이름을 유지한다", () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const { container } = render(<IndustrialHero />);
    act(() => vi.advanceTimersByTime(10000));
    expect(container.querySelector(".ind-slot")).toHaveTextContent("제조 AI");
    expect(container.querySelector(".ind-slot__caret")).toBeNull();
    expect(
      screen.queryByRole("button", { name: /움직임/ }),
    ).not.toBeInTheDocument();
  });
});
