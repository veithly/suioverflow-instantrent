import { RentConsole } from "@/components/rent-console";
import { Nav } from "@/components/nav";
import { getNetworkStatus } from "@/lib/sui-server";
import { getDemoLease } from "@/lib/streams";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const [status, lease] = await Promise.all([
    getNetworkStatus().catch(() => null),
    Promise.resolve(getDemoLease()),
  ]);
  return (
    <main className="min-h-screen">
      <Nav />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Live rent stream</h1>
            <p className="text-muted">Tenant tops up. Landlord watches. Anyone can buy the future cash-flow.</p>
          </div>
          <div className="rounded-lg border border-border bg-panel px-3 py-2 text-xs text-muted">
            <div>Sui {status?.network ?? "testnet"} · checkpoint {status?.checkpoint ?? "—"}</div>
            <div>Hosted wallet: {status?.demo.address ? status.demo.address.slice(0, 14) + "…" : "connect a wallet"}</div>
          </div>
        </header>
        <RentConsole lease={lease} />
      </section>
    </main>
  );
}
