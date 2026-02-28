import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISAC — Intelligent Site Automated Cloner",
  description: "Clone any website into production-ready code with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white antialiased">{children}</body>
    </html>
  );
}
