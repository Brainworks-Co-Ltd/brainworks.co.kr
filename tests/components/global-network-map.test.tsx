import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GlobalNetworkMap, {
  projectToPercent,
} from "@/components/public/GlobalNetworkMap";

const countries = [
  {
    key: "korea",
    label: { ko: "대한민국", en: "Korea" },
    count: 10,
    lon: 127.8,
    lat: 36.3,
  },
  {
    key: "vietnam",
    label: { ko: "베트남", en: "Vietnam" },
    count: 4,
    lon: 106.5,
    lat: 16.5,
  },
  {
    key: "qatar",
    label: { ko: "카타르", en: "Qatar" },
    count: 1,
    lon: 51.2,
    lat: 25.3,
  },
];

const pressed = () =>
  screen.getAllByRole("button", { pressed: true }).map((b) => b.textContent);

describe("글로벌 네트워크 지도", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });
  afterEach(() => vi.useRealTimers());

  it("투영 좌표가 지도 안에 들어온다", () => {
    const korea = projectToPercent(127.8, 36.3);
    expect(korea.left).toBeGreaterThan(80);
    expect(korea.left).toBeLessThan(85);
    expect(korea.top).toBeGreaterThan(30);
    expect(korea.top).toBeLessThan(33);
  });

  it("4초마다 다음 나라로 가고, 목록을 누르면 그 나라로 간다", () => {
    render(<GlobalNetworkMap countries={countries} language="ko" />);
    expect(pressed()).toEqual(["대한민국10"]);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(pressed()).toEqual(["베트남4"]);
    fireEvent.click(screen.getByRole("button", { name: /카타르/ }));
    expect(pressed()).toEqual(["카타르1"]);
  });

  it("멈추면 자동으로 넘어가지 않고 이전/다음은 계속 된다", () => {
    render(<GlobalNetworkMap countries={countries} language="ko" />);
    fireEvent.click(screen.getByRole("button", { name: "자동 넘김 멈춤" }));
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(pressed()).toEqual(["대한민국10"]);
    fireEvent.click(screen.getByRole("button", { name: "이전 나라" }));
    expect(pressed()).toEqual(["카타르1"]);
  });
});
