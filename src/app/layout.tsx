import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORPHEUS — The McDuff Investigation",
  description:
    "An authorized investigation into the computer of Dr. Daniel McDuff. A WebMCP experiment: you and an onboard AI, investigating the same machine from two different perspectives.",
  metadataBase: new URL("https://orpheus-mcduff.vercel.app"),
  openGraph: {
    title: "ORPHEUS — The McDuff Investigation",
    description: "A WebMCP experiment: human + agent investigate the same dead scientist's computer. 25 tools, visible actuation, no generic automation.",
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
