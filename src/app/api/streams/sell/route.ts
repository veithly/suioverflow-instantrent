import { NextResponse } from "next/server";
import { z } from "zod";
import { getDemoLease } from "@/lib/streams";

const Body = z.object({
  leaseId: z.string(),
  sellMonths: z.number().int().positive().max(36),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { sellMonths } = parsed.data;
  const lease = getDemoLease();
  const grossUsd = lease.monthlyRentUsd * sellMonths;
  // 7% annualised discount + 1% lender spread.
  const discount = grossUsd * (0.07 * (sellMonths / 12) + 0.01);
  const payoutUsd = Math.round((grossUsd - discount) * 100) / 100;
  return NextResponse.json({
    leaseId: lease.id,
    sellMonths,
    grossUsd,
    discountUsd: Math.round(discount * 100) / 100,
    payoutUsd,
    lender: "0x4f1c…b3a8 (Streamlend testnet bot)",
  });
}
