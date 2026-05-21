import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://suioverflow-instantrent.veithly.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "InstantRent — Per-second rent streams on Sui",
  description: "Pay rent per-second; landlords sell future streams for instant cash.",
  openGraph: {
    title: "InstantRent",
    description: "Pay rent per-second; landlords sell future streams for instant cash.",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "InstantRent",
    description: "Pay rent per-second; landlords sell future streams for instant cash.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
