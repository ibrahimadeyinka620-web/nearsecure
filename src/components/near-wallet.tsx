import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { WalletSelector } from "@near-wallet-selector/core";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ANCHOR_CONTRACT } from "@/lib/near";

let selectorPromise: Promise<WalletSelector> | undefined;
export function getNearSelector() {
  // Imports and initialization only execute in the browser, never during SSR.
  if (!selectorPromise) selectorPromise = Promise.all([
    import("@near-wallet-selector/core"), import("@near-wallet-selector/my-near-wallet"),
  ]).then(([core, wallet]) => core.setupWalletSelector({ network: "testnet", modules: [wallet.setupMyNearWallet()], createAccessKeyFor: { contractId: ANCHOR_CONTRACT, methodNames: ["addMessage"] } })).catch((error) => { selectorPromise = undefined; throw error; });
  return selectorPromise;
}

const NearWalletContext = createContext<{ accountId: string; connect: () => Promise<void>; disconnect: () => Promise<void>; busy: boolean; error: string }>({ accountId: "", connect: async () => {}, disconnect: async () => {}, busy: false, error: "" });
export const useNearWallet = () => useContext(NearWalletContext);

export function NearWalletProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    getNearSelector().then((selector) => {
      if (!active) return;
      const update = () => setAccountId(selector.store.getState().accounts.find((a) => a.active)?.accountId ?? "");
      update();
      const subscription = selector.store.observable.subscribe(update);
      unsubscribe = () => subscription.unsubscribe();
    }).catch(() => { if (active) setError("Wallet connection is unavailable. Please try again."); });
    return () => { active = false; unsubscribe?.(); };
  }, []);
  async function connect() {
    setBusy(true); setError("");
    try {
      const selector = await getNearSelector();
      const wallet = await selector.wallet("my-near-wallet");
      const accounts = await wallet.signIn({ contractId: ANCHOR_CONTRACT, methodNames: ["addMessage"] });
      setAccountId(accounts[0]?.accountId ?? "");
    } catch (e) { setError(e instanceof Error ? e.message : "Wallet sign-in was cancelled. Try again."); }
    finally { setBusy(false); }
  }
  async function disconnect() {
    setBusy(true); setError("");
    try { const selector = await getNearSelector(); const wallet = await selector.wallet(); await wallet.signOut(); setAccountId(""); }
    catch { setError("Could not disconnect the wallet. Try again."); }
    finally { setBusy(false); }
  }
  return <NearWalletContext.Provider value={{ accountId, connect, disconnect, busy, error }}>{children}</NearWalletContext.Provider>;
}

export function NearWalletButton() {
  const { accountId, connect, disconnect, busy, error } = useNearWallet();
  return <div className="min-w-0 max-w-full">
    <div className="flex items-center gap-2">
      <Button variant="secondary" disabled={busy} onClick={accountId ? undefined : connect} title={accountId || "Connect My NEAR Wallet on testnet"} className="max-w-full">
        {busy ? <Loader2 className="animate-spin" /> : <Wallet />}<span className="truncate">{accountId || "Connect NEAR wallet"}</span>
      </Button>
      {accountId && <Button variant="outline" size="icon" title="Disconnect wallet" aria-label="Disconnect wallet" disabled={busy} onClick={disconnect}><LogOut /></Button>}
    </div>
    {error && <p role="alert" className="mt-2 max-w-sm break-words text-xs text-destructive">{error}</p>}
  </div>;
}