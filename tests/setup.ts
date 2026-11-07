import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { pathname } from "./pathname";

afterEach(() => {
  cleanup();
  pathname.current = "/";
});

// next/navigation needs the App Router runtime; tests set the pathname explicitly.
vi.mock("next/navigation", async () => {
  const { pathname } = await import("./pathname");
  return { usePathname: () => pathname.current };
});
