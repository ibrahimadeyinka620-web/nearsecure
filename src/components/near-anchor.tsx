import { useEffect, useState } from "react";
import { Link2, Copy, Check } from "lucide-react";
import { merkleRoot, nearAnchorCommand } from "@/lib/near";

export function NearAnchorCard({ hashes, caseId }: { hashes: string[]; caseId: string }) {
  const [root, setRoot] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => { merkleRoot(hashes).then(setRoot); }, [hashes]);
  const cmd = nearAnchorCommand(root, caseId);
  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-bold"><Link2 className="h-4 w-4 text-primary" />NEAR proof of evidence</h3>
        <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Not yet on-chain · ready to anchor</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">All {hashes.length} evidence fingerprints are combined into one Merkle root. Saving this root on NEAR testnet lets anyone later prove the files were never changed — without revealing the files.</p>
      <div className="mt-3 text-xs text-muted-foreground">Merkle root (SHA-256)</div>
      <div className="break-all font-mono text-[11px]">{root}</div>
      <div className="mt-3 text-xs text-muted-foreground">Anchor it yourself with NEAR CLI</div>
      <div className="flex items-start gap-2">
        <code className="min-w-0 flex-1 break-all rounded-md bg-card p-2 font-mono text-[10px]">{cmd}</code>
        <button aria-label="Copy NEAR command" onClick={() => { navigator.clipboard.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="rounded-md border p-2">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}</button>
      </div>
      <a href="https://testnet.nearblocks.io" target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-primary underline">Open NEAR testnet explorer</a>
    </div>
  );
}
