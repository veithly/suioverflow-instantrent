"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Transaction } from "@mysten/sui/transactions";
import { useOptionalCurrentAccount, useOptionalDAppKit } from "@/lib/dapp-kit-safe";
import type { Lease } from "@/lib/streams";

const TOP_UP_MIST = 200_000_000; // 0.2 SUI symbolic top-up
const CLOCK_OBJECT_ID = "0x6";
const MOVE_PACKAGE_ID = process.env.NEXT_PUBLIC_MOVE_PACKAGE_ID;

function stringToBytes(value: string) {
  return Array.from(new TextEncoder().encode(value));
}

export function RentConsole({ lease }: { lease: Lease }) {
  const account = useOptionalCurrentAccount();
  const dAppKit = useOptionalDAppKit();
  const [now, setNow] = useState(() => Date.now());
  const [fundedThrough, setFundedThrough] = useState(lease.fundedThrough);
  const [topUpDigest, setTopUpDigest] = useState<string | null>(null);
  const [topUpSigner, setTopUpSigner] = useState<string | null>(null);
  const [sellQuote, setSellQuote] = useState<{ payoutUsd: number; lender: string } | null>(null);
  const [busy, setBusy] = useState<"" | "topup" | "sell">("");
  const [topUpError, setTopUpError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const accruedSeconds = Math.max(0, Math.floor((now - lease.startedAt) / 1000));
  const accruedUsd = (accruedSeconds * lease.perSecondMist) / 1_000_000;
  const fundingRemainingMs = Math.max(0, fundedThrough - now);
  const fundingRemainingHours = (fundingRemainingMs / 3_600_000).toFixed(2);
  const ratePerSecondUsd = (lease.perSecondMist / 1_000_000).toFixed(6);

  async function topUp() {
    setBusy("topup");
    setTopUpError(null);
    try {
      let signedDigest: string | null = null;
      let signerAddress: string | null = null;
      let signerSource: "client" | "server" = "server";
      if (account?.address && dAppKit) {
        signerSource = "client";
        signerAddress = account.address;
        if (!MOVE_PACKAGE_ID) {
          throw new Error("NEXT_PUBLIC_MOVE_PACKAGE_ID is not configured");
        }
        const tx = new Transaction();
        tx.moveCall({
          target: `${MOVE_PACKAGE_ID}::stream::top_up_demo`,
          arguments: [
            tx.pure.vector("u8", stringToBytes(lease.id)),
            tx.pure.u64(24),
            tx.pure.u64(TOP_UP_MIST),
            tx.object(CLOCK_OBJECT_ID),
          ],
        });
        const result = await dAppKit.signAndExecuteTransaction({ transaction: tx });
        if (result.$kind !== "Transaction") {
          throw new Error(
            `Wallet returned a failed transaction: ${
              result.FailedTransaction?.status?.error ?? "unknown"
            }`,
          );
        }
        signedDigest = result.Transaction.digest;
      }

      const r = await fetch("/api/streams/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseId: lease.id,
          hours: 24,
          ...(signedDigest
            ? { signedDigest, signerAddress }
            : {}),
        }),
      }).then((r) => r.json());

      if (r.error) {
        setTopUpError(r.error);
      } else {
        setTopUpDigest(r.digest ?? signedDigest);
        setTopUpSigner(r.signer ?? signerSource);
        setFundedThrough((t) => t + 1000 * 60 * 60 * 24);
        if (r.digest || signedDigest) {
          confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 } });
        }
      }
    } catch (e) {
      setTopUpError(String((e as Error).message ?? e));
    } finally {
      setBusy("");
    }
  }

  async function sellStream() {
    setBusy("sell");
    try {
      const r = await fetch("/api/streams/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseId: lease.id, sellMonths: 11 }),
      }).then((r) => r.json());
      setSellQuote({ payoutUsd: r.payoutUsd, lender: r.lender });
    } finally {
      setBusy("");
    }
  }

  const signerLabel = account?.address
    ? `Connected wallet · ${account.address.slice(0, 8)}…`
    : "Hosted wallet";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-2xl border border-border bg-panel p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted">Tenant pays per-second</div>
            <h2 className="mt-1 text-3xl font-semibold">{lease.unit}</h2>
            <p className="text-sm text-muted">Tenant: {lease.tenant} · Landlord: {lease.landlord}</p>
          </div>
          <div className="rounded-lg border border-border bg-panel-strong px-3 py-2 text-xs text-muted">
            Rate: {ratePerSecondUsd} USDC/sec · {lease.monthlyRentUsd}/mo
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
          <Stat label="Accrued (live)" value={`$${accruedUsd.toFixed(4)}`} accent />
          <Stat label="Funding runway" value={`${fundingRemainingHours}h`} />
          <Stat label="Seconds streamed" value={accruedSeconds.toLocaleString()} />
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-panel-strong px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted">
          <span className={`h-1.5 w-1.5 rounded-full ${account?.address ? "bg-emerald-300" : "bg-amber-300"}`} />
          Signer: {signerLabel}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={topUp}
            disabled={busy !== ""}
            className="rounded-lg bg-accent px-5 py-3 font-medium text-background disabled:opacity-60"
          >
            {busy === "topup" ? "Topping up…" : "Tenant top-up · 24h"}
          </button>
          <button
            onClick={sellStream}
            disabled={busy !== ""}
            className="rounded-lg border border-border px-5 py-3 font-medium text-foreground hover:bg-panel-strong disabled:opacity-60"
          >
            {busy === "sell" ? "Quoting…" : "Sell next 11 months → cash today"}
          </button>
        </div>

        {topUpError ? (
          <div className="mt-4 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            Top-up failed: {topUpError}
          </div>
        ) : null}

        {topUpDigest ? (
          <a
            href={`https://testnet.suivision.xyz/txblock/${topUpDigest}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block break-all text-xs text-accent underline"
          >
            Top-up digest: {topUpDigest}{topUpSigner ? ` (${topUpSigner})` : ""}
          </a>
        ) : null}
      </section>

      <aside className="rounded-2xl border border-border bg-panel p-5">
        <h3 className="text-lg font-semibold">Sell stream quote</h3>
        <p className="text-xs text-muted">
          A lender prices the next 11 months of rent and wires USDC today. Landlord gets liquidity now,
          tenant just keeps streaming as before.
        </p>
        <motion.div
          key={sellQuote ? sellQuote.payoutUsd : "empty"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border border-border bg-panel-strong p-4"
        >
          {sellQuote ? (
            <>
              <div className="text-xs text-muted">Net payout today</div>
              <div className="text-2xl font-semibold text-accent">{sellQuote.payoutUsd.toLocaleString()} USDC</div>
              <div className="mt-1 text-xs text-muted">Lender: {sellQuote.lender}</div>
            </>
          ) : (
            <p className="text-muted">Hit “Sell next 11 months” to see a live quote.</p>
          )}
        </motion.div>
      </aside>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-panel-strong p-4">
      <div className="text-xs uppercase tracking-widest text-muted">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent ? "text-accent" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
