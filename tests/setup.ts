import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// next/font는 Next 컴파일러가 빌드 때 바꿔 끼우는 모듈이라 vitest에서는 로더가 없다.
vi.mock("next/font/google", () => ({
  IBM_Plex_Mono: () => ({ className: "font-hero-slot" }),
}));

afterEach(() => cleanup());
