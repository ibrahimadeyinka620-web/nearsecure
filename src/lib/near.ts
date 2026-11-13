import { sha256Hex } from "./resolve";

const hex = (s: string) => new TextEncoder().encode(s).buffer as ArrayBuffer;

/** Real SHA-256 Merkle root over evidence hashes (pairs hashed left+right; odd leaf is carried up). */
export async function merkleRoot(leaves: string[]): Promise<string> {
  if (!leaves.length) return "";
  let level = [...leaves];
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const a = level[i]!, b = level[i + 1];
      next.push(b === undefined ? a : await sha256Hex(hex(a + b)));
    }
    level = next;
  }
  return level[0]!;
}

/** NEAR CLI command a merchant can run to anchor the root on testnet themselves. */
export function nearAnchorCommand(root: string, caseId: string, account = "<your-account>.testnet") {
  const args = JSON.stringify({ case_id: caseId, merkle_root: root });
  return `near call ${account} anchor '${args}' --accountId ${account} --networkId testnet`;
}
