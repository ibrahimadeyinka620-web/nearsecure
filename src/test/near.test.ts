import { describe, it, expect } from "vitest";
import { merkleRoot, anchorTransaction, proofFromOutcome, verifyAnchor } from "@/lib/near";
import { vi } from "vitest";
describe("merkle root", () => {
  it("is the leaf itself for one document", async () => { expect(await merkleRoot(["abc"])).toBe("abc"); });
  it("changes when any evidence hash changes", async () => {
    expect(await merkleRoot(["a", "b", "c"])).not.toBe(await merkleRoot(["a", "b", "d"]));
  });
});

const root = "a".repeat(64);
const outcome = () => ({ final_execution_status: "FINAL", status: { SuccessValue: "" }, transaction: { hash: "test-transaction", signer_id: "seller.testnet", receiver_id: "guest-book.testnet", actions: [{ FunctionCall: { method_name: "addMessage", args: btoa(anchorTransaction("VT-4821", root).actions[0]?.params.args.text ?? "") } }] }, receipts_outcome: [] });

describe("NEAR evidence commitments", () => {
  it("sends only the case reference and root, with zero deposit, to testnet", () => {
    const tx = anchorTransaction("VT-4821", root);
    expect(tx.receiverId).toBe("guest-book.testnet");
    expect(tx.actions[0]?.params.deposit).toBe("0");
    expect(JSON.parse(tx.actions[0]?.params.args.text ?? "")).toEqual({ app: "Veritrail", version: 1, case_id: "VT-4821", merkle_root: root });
  });
  it("rejects an empty or malformed root", () => {
    expect(() => anchorTransaction("VT-4821", "")).toThrow();
    expect(() => anchorTransaction("VT-4821", "not-a-hash")).toThrow();
  });
  it("adds a testnet explorer proof only for matching successful final execution", () => {
    const proof = proofFromOutcome(outcome(), "VT-4821", root, "seller.testnet");
    expect(proof.explorerUrl).toBe("https://testnet.nearblocks.io/txns/test-transaction");
    expect(proof.network).toBe("testnet");
    expect(proof.root).toBe(root);
  });
  it("does not treat pending or failed execution as saved on-chain", () => {
    expect(() => proofFromOutcome({ ...outcome(), final_execution_status: "EXECUTED" }, "VT-4821", root, "seller.testnet")).toThrow();
    expect(() => proofFromOutcome({ ...outcome(), status: { Failure: {} } }, "VT-4821", root, "seller.testnet")).toThrow();
    expect(() => proofFromOutcome({ ...outcome(), receipts_outcome: [{ outcome: { status: { Failure: {} } } }] }, "VT-4821", root, "seller.testnet")).toThrow();
  });
  it("rejects another case or modified evidence root", () => {
    expect(() => proofFromOutcome(outcome(), "VT-9999", root, "seller.testnet")).toThrow();
    expect(() => proofFromOutcome(outcome(), "VT-4821", "b".repeat(64), "seller.testnet")).toThrow();
  });
  it("rejects the wrong signer or contract", () => {
    expect(() => proofFromOutcome(outcome(), "VT-4821", root, "other.testnet")).toThrow();
    const wrong = outcome(); wrong.transaction.receiver_id = "other.testnet";
    expect(() => proofFromOutcome(wrong, "VT-4821", root, "seller.testnet")).toThrow();
  });
  it("requires a successful blockchain response rather than trusting a cached pointer", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ error: { message: "unknown transaction" } }) }));
    try { await expect(verifyAnchor("unknown", "seller.testnet", "VT-4821", root)).rejects.toThrow(); }
    finally { vi.unstubAllGlobals(); }
  });
});
