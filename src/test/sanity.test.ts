import { describe, it, expect } from "vitest";
import fc from "fast-check";

// Harness smoke test: confirms Vitest runs and fast-check is wired in.
describe("test harness", () => {
  it("runs a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("runs a fast-check property (addition is commutative)", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a;
      }),
      { numRuns: 25 }
    );
  });
});
