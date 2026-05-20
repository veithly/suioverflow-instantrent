import { NextResponse } from "next/server";
import { Transaction } from "@mysten/sui/transactions";
import { getDemoKeypair, getSuiClient } from "@/lib/sui-server";
import { z } from "zod";

const Body = z.object({
  leaseId: z.string(),
  hours: z.number().int().positive().max(24 * 30),
  // Optional: when set, the client has already signed and broadcast the PTB
  // (e.g. through Mysten dApp Kit). We propagate the digest verbatim.
  signedDigest: z.string().optional(),
  signerAddress: z.string().optional(),
});

const TOP_UP_MIST = 200_000_000; // 0.2 SUI symbolic top-up

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { signedDigest, signerAddress } = parsed.data;

  if (signedDigest) {
    return NextResponse.json({
      ok: true,
      mode: "real",
      signer: "client",
      signerAddress: signerAddress ?? null,
      digest: signedDigest,
    });
  }

  const keypair = getDemoKeypair();
  if (!keypair) {
    return NextResponse.json({
      ok: true,
      mode: "dry-run",
      signer: "none",
      digest: null,
      note: "Connect a wallet, or set SUI_DEMO_PRIVATE_KEY for a real on-chain top-up.",
    });
  }
  try {
    const client = getSuiClient();
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [TOP_UP_MIST]);
    tx.transferObjects([coin], keypair.toSuiAddress());
    tx.setSender(keypair.toSuiAddress());
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: { showEffects: true },
    });
    return NextResponse.json({
      ok: true,
      mode: "real",
      signer: "server-demo",
      signerAddress: keypair.toSuiAddress(),
      digest: result.digest,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String((e as Error).message ?? e) }, { status: 500 });
  }
}
