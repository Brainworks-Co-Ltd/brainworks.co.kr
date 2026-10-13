import { act, fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HeroSlot from "@/components/public/HeroSlot";
import Rail from "@/components/public/Rail";
import IndustrialHero from "@/components/industrial/IndustrialHero";

vi.mock("@/shared/routing/useLocale", () => ({
  useLocale: () => ({ language: "ko" }),
}));

beforeEach(() => {
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

  it("새 HeroSlot은 빈 상태에서 시작해 타이핑하고 지운 뒤 다음 현장을 타이핑한다", () => {
    vi.useFakeTimers();
    // heading 전체에는 슬롯 뒤 문장이 함께 들어 있어 타이핑 상태를 구분하기
    // 어렵다. 실제로 움직이는 라이브 텍스트 레이어(.bw-hero-live)만 읽는다.
    const { container } = render(
      <HeroSlot slots={["제조 현장", "진료 현장"]} />,
    );
    const live = () => container.querySelector(".bw-hero-live");
    // 20ms처럼 각 단계(타이핑 110ms, 지우기 55ms)보다 잘게 나눠 advance한다.
    // 매 글자마다 effect가 다음 setTimeout을 새로 예약하므로 한 번에
    // 몰아 advance하면 뒤이은 예약을 건너뛴다.
    const tick = (count: number) => {
      for (let i = 0; i < count; i += 1) act(() => vi.advanceTimersByTime(20));
    };

    // 마운트 시점에는 빈 문자열에서 시작한다.
    expect(live()?.textContent).toBe("");

    // 타이핑(110ms × 5글자 = 550ms)이 끝나면 첫 단어가 완성된다.
    tick(40); // 800ms
    expect(live()?.textContent).toBe("제조 현장");

    // 정지(1500ms) 동안 완성된 채로 머문다. 지금까지 800ms 지났으므로
    // 1500ms 안쪽까지만 더 진행한다.
    tick(60); // +1200ms = 2000ms 누적, 정지 종료(2050ms)는 아직
    expect(live()?.textContent).toBe("제조 현장");

    // 정지가 끝나고 지우기(55ms × 5글자 = 275ms)로 넘어가 다음 단어가
    // 타이핑되기 전에(쉼 400ms 동안) 완전히 비워진다.
    tick(40); // +800ms = 2800ms 누적
    expect(live()?.textContent).toBe("");

    // 쉼 뒤 다음 현장이 다시 한 글자씩 타이핑되어 결국 완성된다.
    tick(60); // +1200ms = 4000ms 누적, 두 번째 타이핑 완료(3275ms)를 지남
    expect(live()?.textContent).toBe("진료 현장");
  });

  it("새 HeroSlot은 동작 줄이기에서도 현장 이름을 완성된 상태로 전환한다", () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    render(<HeroSlot slots={["제조 현장", "진료 현장"]} />);
    const heading = screen.getByRole("heading", { level: 2 });
    act(() => vi.advanceTimersByTime(3000));
    expect(heading).toHaveTextContent("진료 현장");
    act(() => vi.advanceTimersByTime(3000));
    expect(heading).toHaveTextContent("제조 현장");
  });

  it("HeroSlot 커서는 일반 모션에서만 나타나고 동작 줄이기에서는 사라진다", () => {
    vi.useFakeTimers();
    const { container: normal } = render(
      <HeroSlot slots={["제조 현장", "진료 현장"]} />,
    );
    act(() => vi.advanceTimersByTime(110));
    expect(normal.querySelector(".bw-hero-caret")).not.toBeNull();

    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const { container: reduced } = render(
      <HeroSlot slots={["제조 현장", "진료 현장"]} />,
    );
    act(() => vi.advanceTimersByTime(3000));
    expect(reduced.querySelector(".bw-hero-caret")).toBeNull();
  });

  it("HeroSlot은 동작 줄이기 방문자에게도 서버 HTML과 어긋나지 않게 하이드레이션한다", async () => {
    const ui = <HeroSlot slots={["제조 현장", "진료 현장"]} />;
    const container = document.createElement("div");
    // 서버는 방문자의 동작 줄이기 설정을 모른다(기본 matchMedia는 false).
    container.innerHTML = renderToString(ui);
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const onRecoverableError = vi.fn();
    await act(async () => {
      hydrateRoot(container, ui, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector(".bw-hero-live")?.textContent).toBe(
      "제조 현장",
    );
    expect(container.querySelector(".bw-hero-caret")).toBeNull();
  });

  it("HeroSlot 슬롯 칸은 브라우저 번역에서 빠진다", () => {
    const { container } = render(
      <HeroSlot slots={["제조 현장", "진료 현장"]} />,
    );
    const slot = container.querySelector(".bw-hero-live")?.parentElement;
    expect(slot).toHaveAttribute("translate", "no");
    expect(slot).toHaveClass("notranslate");
  });

  it("HeroSlot은 번역기가 글자를 바꿔 끼운 뒤 언어가 바뀌어도 깨지지 않는다", () => {
    const slots = ["Manufacturing AI", "Healthcare & Bio AI"];
    const { container, rerender } = render(
      <HeroSlot
        slots={slots}
        question={"{slot}를 도입하면\n업무가 달라질까요?"}
      />,
    );
    // 브라우저 번역처럼 번역 대상 글자 노드를 <font>로 바꿔 끼운다(translate="no" 칸은 건너뛴다).
    const walker = document.createTreeWalker(
      container.querySelector("h2")!,
      NodeFilter.SHOW_TEXT,
    );
    const texts: Text[] = [];
    while (walker.nextNode()) texts.push(walker.currentNode as Text);
    for (const text of texts) {
      if (text.parentElement?.closest('[translate="no"]')) continue;
      const font = document.createElement("font");
      font.textContent = text.nodeValue;
      text.replaceWith(font);
    }
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    rerender(
      <HeroSlot
        slots={slots}
        question={"How could {slot}\nchange your work?"}
      />,
    );
    errors.mockRestore();
    expect(container.querySelector("h2")).toHaveTextContent("How could");
  });

  it("HeroSlot은 슬롯이 비어 있어도 조사와 뒤 문장을 남긴다", () => {
    vi.useFakeTimers();
    const { container } = render(
      <HeroSlot
        slots={["Manufacturing AI", "Healthcare & Bio AI"]}
        question={"{slot}를 도입하면\n업무가 달라질까요?"}
      />,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    // 마운트 직후 슬롯은 빈 문자열이지만 조사와 뒤 문장은 이미 보여야 한다.
    expect(container.querySelector(".bw-hero-live")?.textContent).toBe("");
    expect(heading).toHaveTextContent("를 도입하면");
    expect(heading).toHaveTextContent("업무가 달라질까요?");
  });

  it("카드가 모두 들어오면 Rail 이동 인디케이터를 숨긴다", () => {
    render(
      <Rail>
        <li>첫 카드</li>
        <li>두 번째 카드</li>
      </Rail>,
    );
    expect(
      screen.queryByRole("button", { name: "이전" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "다음" }),
    ).not.toBeInTheDocument();
  });
});
