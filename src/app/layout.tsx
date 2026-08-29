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
      "Co-op for the nights your friends are offline: 25 WebMCP tools plus 4 declarative forms, visible actuation, no generic automation. Human eyes + machine recall at one desk.",
    url: "https://orpheus-mcduff.vercel.app/",
    siteName: "ORPHEUS",
    type: "website",
    images: [
      {
        url: "/Images/PhotoDSC04821.png",
        width: 800,
        height: 600,
        alt: "ORPHEUS — The McDuff Investigation: a dead scientist's workstation, a shared desk for you and your agent",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ORPHEUS — The McDuff Investigation",
    description:
      "A WebMCP co-op mystery. You see what the agent cannot; the agent remembers what you cannot. One desk, two investigators.",
    images: ["/Images/PhotoDSC04821.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#060808",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* The Declarative API focus indicators, per
   https://developer.chrome.com/docs/ai/webmcp/declarative-api#modify-focus-indicator.
   `:tool-form-active` and `:tool-submit-active` are newer than the CSS parsers in
   the build pipeline, which would strip them from globals.css, so they ship
   verbatim here behind an @supports guard — no effect in browsers without WebMCP,
   full effect in browsers with it. */
const WEBMCP_STYLES = `@supports selector(:tool-form-active) {
  form:tool-form-active { outline: 1px dashed var(--accent); outline-offset: 2px; }
  input:tool-submit-active, button:tool-submit-active { outline: 1px dashed var(--amber); outline-offset: 1px; }
}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plex.variable} h-full antialiased`}>
      <head>
        <style>{WEBMCP_STYLES}</style>
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
