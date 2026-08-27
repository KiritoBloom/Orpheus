import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORPHEUS — The McDuff Investigation",
  description:
    "An authorized investigation into the computer of Dr. Daniel McDuff. A WebMCP experiment: you and an onboard AI, investigating the same machine from two different perspectives.",
};

export const viewport: Viewport = {
  themeColor: "#060808",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
