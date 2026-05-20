import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3120"),
  title: "InstantRent — Per-second rent streams on Sui",
  description: "Pay rent per-second; landlords sell future streams for instant cash.",
  openGraph: {
    title: "InstantRent",
    description: "Pay rent per-second; landlords sell future streams for instant cash.",
    images: ["/og.svg"],
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
