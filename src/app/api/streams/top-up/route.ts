import { NextResponse } from "next/server";
import { Transaction } from "@mysten/sui/transactions";
import {
  CLOCK_OBJECT_ID,
  firstCreatedObjectId,
  getDemoKeypair,
  getMovePackageId,
  getSuiClient,
  stringToBytes,
} from "@/lib/sui-server";
import { z } from "zod";

const Body = z.object({
  leaseId: z.string(),
  hours: z.number().int().positive().max(24 * 30),
  signedDigest: z.string().optional(),
  signerAddress: z.string().optional(),
});

const TOP_UP_MIST = 200_000_000;

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { leaseId, hours, signedDigest, signerAddress } = parsed.data;
  const packageId = getMovePackageId();

  if (!packageId) {
    return NextResponse.json({ error: "NEXT_PUBLIC_MOVE_PACKAGE_ID is not configured" }, { status: 503 });
  }

  if (signedDigest) {
    return NextResponse.json({
      ok: true,
      mode: "real",
      chainMode: "move-call",
      signer: "client",
      signerAddress: signerAddress ?? null,
      packageId,
      digest: signedDigest,
    });
  }

  const keypair = getDemoKeypair();
  if (!keypair) {
    return NextResponse.json({
      ok: true,
      mode: "dry-run",
      signer: "none",
      packageId,
      digest: null,
      note: "Connect a wallet, or set SUI_DEMO_PRIVATE_KEY for a real on-chain top-up.",
    });
  }
  try {
    const client = getSuiClient();
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::stream::top_up_demo`,
      arguments: [
        tx.pure.vector("u8", stringToBytes(leaseId)),
        tx.pure.u64(hours),
        tx.pure.u64(TOP_UP_MIST),
        tx.object(CLOCK_OBJECT_ID),
      ],
    });
    tx.setSender(keypair.toSuiAddress());
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: { showEffects: true, showObjectChanges: true, showEvents: true },
    });
    return NextResponse.json({
      ok: true,
      mode: "real",
      chainMode: "move-call",
      signer: "server-demo",
      signerAddress: keypair.toSuiAddress(),
      packageId,
      objectId: firstCreatedObjectId(result, "::stream::TopUpReceipt"),
      digest: result.digest,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String((e as Error).message ?? e) }, { status: 500 });
  }
}
