export interface Lease {
  id: string;
  unit: string;
  tenant: string;
  landlord: string;
  monthlyRentUsd: number;
  startedAt: number;     // ms
  fundedThrough: number; // ms — paid up through this timestamp
  perSecondMist: number;
}

const ONE_MONTH_SECONDS = 30 * 24 * 60 * 60;
const TESTNET_USDC_DECIMALS = 1_000_000; // mist-like base units in this demo

export const DEMO_LEASE: Lease = {
  id: "lease-mock-001",
  unit: "12B · Lalbagh Road · Bangalore",
  tenant: "Priya R.",
  landlord: "Atharva N. (landlord wallet)",
  monthlyRentUsd: 480,
  startedAt: Date.now() - 1000 * 60 * 60 * 24 * 8, // 8 days ago
  fundedThrough: Date.now() + 1000 * 60 * 60 * 4,  // 4 hours of buffer
  perSecondMist: Math.round((480 * TESTNET_USDC_DECIMALS) / ONE_MONTH_SECONDS),
};

export function getDemoLease() {
  return DEMO_LEASE;
}
