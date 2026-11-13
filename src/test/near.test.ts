import { describe, it, expect } from "vitest";
import { merkleRoot } from "@/lib/near";
describe("merkle root", () => {
  it("is the leaf itself for one document", async () => { expect(await merkleRoot(["abc"])).toBe("abc"); });
  it("changes when any evidence hash changes", async () => {
    expect(await merkleRoot(["a", "b", "c"])).not.toBe(await merkleRoot(["a", "b", "d"]));
  });
});
