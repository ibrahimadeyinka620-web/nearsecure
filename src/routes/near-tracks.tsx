import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Fingerprint, ShieldCheck, Wallet, FileCheck2, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/near-tracks")({
  head: () => ({ meta: [
    { title: "Veritrail × NEAR — Privacy & Real-World Money" },
    { name: "description", content: "How Veritrail combines local evidence checks and NEAR testnet commitments to explore private seller evidence and real-world money workflows." },
    { property: "og:title", content: "Veritrail × NEAR — Privacy & Real-World Money" },
    { property: "og:description", content: "Private documents stay local. Evidence fingerprints can be recorded on NEAR testnet. Fund releases remain simulations." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: NearTracks,
});

function NearTracks() {
  return <div className="min-h-screen bg-background text-foreground">
    <header className="bg-primary text-primary-foreground">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5"><Link to="/" className="flex items-center gap-3 font-display text-lg font-bold"><Logo className="h-10 w-10" />Veritrail</Link><Button asChild variant="secondary"><Link to="/demo" search={{}}>Try the prototype <ArrowRight /></Link></Button></nav>
      <div className="mx-auto max-w-6xl px-6 pb-14 pt-8"><p className="text-sm font-semibold text-gold">NEAR Hackathon · proposed track fit</p><h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">Veritrail × NEAR</h1><p className="mt-5 max-w-2xl text-lg text-primary-foreground/80">Keep seller evidence private. Make its fingerprint public. Give reviewers a clearer path from held money to a documented decision.</p></div>
    </header>
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Button asChild variant="link" className="px-0"><Link to="/"><ArrowLeft />Back to overview</Link></Button>
      <section className="grid gap-8 border-b py-10 md:grid-cols-[1fr_1.3fr]">
        <div><LockKeyhole className="h-8 w-8 text-secondary" /><p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">Track 01</p><h2 className="mt-2 text-3xl font-bold">Privacy & Private AI</h2><p className="mt-4 text-muted-foreground">A seller’s invoice can contain names, addresses and payment details. Checking it should not mean publishing it.</p></div>
        <div className="space-y-5"><h3 className="text-xl font-bold">Private evidence. Public commitment.</h3><ul className="space-y-4 text-sm"><li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-secondary" /><span>Text evidence is checked and sensitive fields are masked inside the browser. Raw files are not uploaded by this prototype.</span></li><li className="flex gap-3"><Fingerprint className="h-5 w-5 shrink-0 text-secondary" /><span>A SHA-256 Merkle root combines the files’ fingerprints. The wallet records only that root and a case reference on NEAR testnet.</span></li><li className="flex gap-3"><FileCheck2 className="h-5 w-5 shrink-0 text-secondary" /><span>Reviewers can compare a later set of files against the public commitment without putting the files on-chain.</span></li></ul><p className="border-l-2 border-secondary pl-4 text-sm text-muted-foreground"><b className="text-foreground">Current boundary:</b> extraction and summaries are rule-based, not private AI inference. There is no trusted execution environment, zero-knowledge proof, or guarantee that masking catches every sensitive field. Private AI integration is future work, not a completed capability.</p></div>
      </section>
      <section className="grid gap-8 border-b py-10 md:grid-cols-[1fr_1.3fr]">
        <div><Wallet className="h-8 w-8 text-secondary" /><p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">Track 02</p><h2 className="mt-2 text-3xl font-bold">Real-World Money</h2><p className="mt-4 text-muted-foreground">When money is held, sellers still have suppliers to pay. Missing evidence adds friction to an already stressful review.</p></div>
        <div className="space-y-5"><h3 className="text-xl font-bold">A proof trail for seller payments.</h3><p className="text-sm leading-relaxed">Veritrail compares purchase orders, invoices and delivery records before submission. Missing signatures and conflicting quantities block incomplete packets. A reviewer then makes a simulated release decision, and the receipt can carry a real NEAR testnet proof link.</p><p className="text-sm leading-relaxed">NEAR gives the workflow a public transaction record signed by the connected wallet. The record is independent of this website and shows which evidence fingerprint was committed.</p><p className="border-l-2 border-secondary pl-4 text-sm text-muted-foreground"><b className="text-foreground">Current boundary:</b> the $12,500 case uses sample data. No bank, stablecoin, escrow or payment-platform integration moves funds. Faster real-world settlement and saved costs have not been measured.</p></div>
      </section>
      <section className="py-10"><h2 className="text-2xl font-bold">What you can verify today</h2><ol className="mt-6 grid gap-6 sm:grid-cols-3">{["Load the sample evidence and check the missing-item rules.", "Submit a clean packet and approve the simulated release.", "Connect a funded testnet wallet, save the receipt’s fingerprint, and open its confirmed NEAR transaction."].map((text, i) => <li key={text} className="border-t-2 border-secondary pt-4"><span className="font-mono text-sm text-secondary">0{i + 1}</span><p className="mt-3 text-sm leading-relaxed">{text}</p></li>)}</ol><p className="mt-8 text-sm text-muted-foreground">Testnet commitments use NEAR’s shared guest-book.testnet example contract. This page describes intended track alignment, not confirmation of official eligibility or endorsement.</p><Button asChild size="lg" className="mt-6"><Link to="/demo" search={{ scenario: "clean" }}>Open the clean-case demo <ArrowRight /></Link></Button></section>
    </main>
  </div>;
}