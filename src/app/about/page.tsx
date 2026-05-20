import { Nav } from "@/components/nav";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <section className="mx-auto max-w-3xl px-6 py-16 prose prose-invert">
        <h1>InstantRent</h1>
        <p className="text-muted">
          Pay rent per-second. Landlords sell future streams for instant cash.
        </p>
        <p>
          InstantRent turns a fixed-term lease into a per-second stream of micropayments and a
          tradable cash-flow claim. The tenant tops up a single coin object; the landlord watches
          the meter tick; and at any moment the landlord can sell the remaining stream to a buyer
          who pays a discounted lump sum and inherits the right to receive the rest of the rent.
        </p>
        <p>
          The whole flow — top-up, settle, sell — is one programmable transaction block on Sui.
          Real digest, real explorer link, real settlement. The numbers on the meter are not a
          countdown timer; they are an on-chain object whose <code>last_settled_ms</code> field
          updates with every interaction.
        </p>
      </section>
    </main>
  );
}
