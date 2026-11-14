import { useEffect, useState } from "react";
import { Link2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { merkleRoot, anchorTransaction, verifyAnchor, type AnchorProof } from "@/lib/near";
import { getNearSelector, useNearWallet, NearWalletButton } from "@/components/near-wallet";
import { Button } from "@/components/ui/button";
import type { InjectedWallet } from "@near-wallet-selector/core";

export function NearAnchorCard({ hashes, caseId, onProof }: { hashes: string[]; caseId: string; onProof?: (proof: AnchorProof | null) => void }) {
  const [root, setRoot] = useState("");
  const [proof, setProof] = useState<AnchorProof | null>(null);
  const [pending, setPending] = useState<{ transactionHash: string; accountId: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { accountId } = useNearWallet();
  const fingerprint = hashes.join(":");
  useEffect(() => {
    let active = true;
    setRoot(""); setProof(null); setPending(null); onProof?.(null);
    merkleRoot(fingerprint ? fingerprint.split(":") : []).then(async (value) => {
      if (!active) return;
      setRoot(value);
      // Local cache is only a pointer; always re-check the public blockchain.
      try {
        const saved = sessionStorage.getItem(`veritrail-anchor:${caseId}:${value}`);
        if (!saved) return;
        const reference = JSON.parse(saved) as { transactionHash: string; accountId: string };
        setPending(reference);
        const verified = await verifyAnchor(reference.transactionHash, reference.accountId, caseId, value);
        if (active) { setProof(verified); onProof?.(verified); }
      } catch { if (active) setError("The saved proof could not be confirmed. Check it again before sharing."); }
    }).catch(() => { if (active) setError("Could not calculate the evidence fingerprint."); });
    return () => { active = false; };
  }, [fingerprint, caseId, onProof]);
  async function anchor() {
    setBusy(true); setError("");
    try {
      let reference = pending;
      if (!reference) {
        if (!accountId) throw new Error("Connect a testnet wallet first.");
        const selector = await getNearSelector();
        const wallet = await selector.wallet<InjectedWallet>("my-near-wallet");
        const tx = anchorTransaction(caseId, root);
        const { actionCreators } = await import("@near-js/transactions");
        const result = await wallet.signAndSendTransaction({ signerId: accountId, receiverId: tx.receiverId, actions: tx.actions.map(({ params }) => actionCreators.functionCall(params.methodName, params.args, BigInt(params.gas), BigInt(params.deposit))) });
        if (!result?.transaction.hash) throw new Error("No transaction was returned by the wallet. No proof has been confirmed.");
        reference = { transactionHash: result.transaction.hash, accountId };
        setPending(reference);
        sessionStorage.setItem(`veritrail-anchor:${caseId}:${root}`, JSON.stringify(reference));
      }
      const verified = await verifyAnchor(reference.transactionHash, reference.accountId, caseId, root);
      setProof(verified); onProof?.(verified);
    } catch (e) { setError(e instanceof Error ? e.message : "The transaction was not confirmed. Please try again."); }
    finally { setBusy(false); }
  }
  return (
    <section className="border-t pt-5" aria-label="NEAR proof of evidence">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-bold"><Link2 className="h-4 w-4 text-primary" />NEAR proof of evidence</h3>
        <span className={`text-xs font-semibold ${proof ? "text-success" : "text-muted-foreground"}`}>{proof ? "Confirmed on NEAR testnet" : busy ? "Waiting for confirmation…" : "Not yet on-chain"}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{hashes.length} file fingerprints, one public proof. Only the case reference and combined fingerprint leave your device—not your documents.</p>
      <div className="mt-3 text-xs text-muted-foreground">Merkle root (SHA-256)</div>
      <div className="break-all font-mono text-[11px]">{root}</div>
      {proof ? <div className="mt-4 space-y-2"><p className="flex items-center gap-2 text-sm text-success"><ShieldCheck className="h-4 w-4" />Real blockchain proof · demo funds only</p><p className="break-all text-xs text-muted-foreground">Signed by {proof.accountId}</p><Button asChild variant="outline"><a href={proof.explorerUrl} target="_blank" rel="noreferrer">View proof on NEAR <ExternalLink /></a></Button></div> : <div className="mt-4 space-y-3"><NearWalletButton /><Button onClick={anchor} disabled={busy || !root || !hashes.length || (!accountId && !pending)} className="h-auto whitespace-normal py-3">{busy ? <Loader2 className="animate-spin" /> : <Link2 />}{pending ? "Check transaction confirmation" : "Save evidence proof on NEAR"}</Button></div>}
      {error && <p role="alert" className="mt-3 break-words text-sm text-destructive">{error}</p>}
      <p className="mt-3 text-xs text-muted-foreground">Testnet only. Your wallet pays network fees in test NEAR; no deposit is sent. This prototype records the commitment through NEAR’s shared guest-book.testnet example contract, not a dedicated Veritrail contract. A fingerprint proves commitment to bytes, not that a document is truthful.</p>
    </section>
  );
}
