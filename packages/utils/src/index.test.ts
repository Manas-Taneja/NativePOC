import { describe, expect, it } from "vitest";
import { formatRelativeTime, clamp } from "./index";

describe("formatRelativeTime", () => {
  it("handles future values", () => {
    const future = new Date(Date.now() + 1000 * 60 * 30);
    expect(formatRelativeTime(future)).toMatch(/in 30m/);
  });

  it("handles past values", () => {
    const past = new Date(Date.now() - 1000 * 60 * 90);
    expect(formatRelativeTime(past)).toMatch(/1h ago/);
  });
});

describe("clamp", () => {
  it("bounds values", () => {
    expect(clamp(10, 0, 5)).toBe(5);
  });
});
