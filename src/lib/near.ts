import { sha256Hex } from "./resolve";

const hex = (s: string) => new TextEncoder().encode(s).buffer as ArrayBuffer;

/** Real SHA-256 Merkle root over evidence hashes (pairs hashed left+right; odd leaf is carried up). */
export async function merkleRoot(leaves: string[]): Promise<string> {
  if (!leaves.length) return "";
  let level = [...leaves];
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const a = level[i], b = level[i + 1];
      if (a === undefined) continue;
      next.push(b === undefined ? a : await sha256Hex(hex(a + b)));
    }
    level = next;
  }
  return level[0] ?? "";
}

/** NEAR CLI command a merchant can run to anchor the root on testnet themselves. */
export function nearAnchorCommand(root: string, caseId: string, account = "<your-account>.testnet") {
  const args = JSON.stringify({ case_id: caseId, merkle_root: root });
  return `near call ${account} anchor '${args}' --accountId ${account} --networkId testnet`;
}

/** Shared NEAR example contract: records public text in a real testnet transaction. */
export const ANCHOR_CONTRACT = "guest-book.testnet";
export const NEAR_RPC = "https://rpc.testnet.near.org";
export type AnchorProof = { network: "testnet"; contractId: string; caseId: string; root: string; accountId: string; transactionHash: string; explorerUrl: string };

export function anchorTransaction(caseId: string, root: string) {
  if (!/^[a-f0-9]{64}$/.test(root)) throw new Error("A complete SHA-256 evidence root is required.");
  if (!caseId || caseId.length > 100) throw new Error("A valid case reference is required.");
  return {
    receiverId: ANCHOR_CONTRACT,
    actions: [{ type: "FunctionCall" as const, params: {
      methodName: "addMessage",
      args: { text: JSON.stringify({ app: "Veritrail", version: 1, case_id: caseId, merkle_root: root }) },
      gas: "30000000000000", deposit: "0",
    } }],
  };
}

/** Only final successful execution of the EXACT commitment qualifies as proof. */
export function proofFromOutcome(outcome: unknown, caseId: string, root: string, accountId: string): AnchorProof {
  const o = outcome as { final_execution_status?: string; status?: Record<string, unknown>; transaction?: { hash?: string; signer_id?: string; receiver_id?: string; actions?: { FunctionCall?: { method_name?: string; args?: string } }[] }; receipts_outcome?: { outcome: { status: Record<string, unknown> } }[] };
  const expected = anchorTransaction(caseId, root);
  const tx = o.transaction;
  const call = tx?.actions?.[0]?.FunctionCall;
  if (o.final_execution_status !== "FINAL" || !o.status || !("SuccessValue" in o.status) || o.receipts_outcome?.some((r) => "Failure" in r.outcome.status)) throw new Error("The NEAR transaction has not completed successfully. Try checking again.");
  if (!tx?.hash || tx.signer_id !== accountId || tx.receiver_id !== ANCHOR_CONTRACT || tx.actions?.length !== 1 || call?.method_name !== "addMessage" || !call.args || atob(call.args) !== expected.actions[0]?.params.args.text) throw new Error("This transaction does not match this case’s evidence fingerprint.");
  return { network: "testnet", contractId: ANCHOR_CONTRACT, caseId, root, accountId, transactionHash: tx.hash, explorerUrl: `https://testnet.nearblocks.io/txns/${encodeURIComponent(tx.hash)}` };
}

export async function verifyAnchor(transactionHash: string, accountId: string, caseId: string, root: string): Promise<AnchorProof> {
  const response = await fetch(NEAR_RPC, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: "veritrail-proof", method: "tx", params: { tx_hash: transactionHash, sender_account_id: accountId, wait_until: "FINAL" } }) });
  if (!response.ok) throw new Error(`NEAR could not check the transaction (${response.status}). Try again.`);
  const data = await response.json() as { error?: unknown; result?: unknown };
  if (data.error || !data.result) throw new Error("NEAR has not returned a confirmed transaction yet. Try again shortly.");
  return proofFromOutcome(data.result, caseId, root, accountId);
}
