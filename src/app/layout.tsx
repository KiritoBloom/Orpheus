import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted font with display:swap, variable, latin subset — no external @import, optimal CLS
const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-mono",
  fallback: ["JetBrains Mono", "Cascadia Mono", "Consolas", "Courier New", "monospace"],
});

export const metadata: Metadata = {
  title: "ORPHEUS — The McDuff Investigation",
  description:
    "A new horizon for human-agent co-presence: a co-op mystery you can play at 10pm when your friends are offline and still feel accompanied — you see what the agent cannot, it remembers what you cannot. Not a replacement for people, just presence.",
  metadataBase: new URL("https://orpheus-mcduff.vercel.app"),
  openGraph: {
    title: "ORPHEUS — The McDuff Investigation",
    description:
      "Co-op for the nights your friends are offline: 26 WebMCP tools, visible actuation, no generic automation. Human eyes + machine recall at one desk.",
    url: "https://orpheus-mcduff.vercel.app/",
    siteName: "ORPHEUS",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#060808",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plex.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
