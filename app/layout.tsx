import "./globals.css";
import type { Metadata } from "next";

export const metadata = {
  title: "ArtiPoxi",
  description: "ArtiPoxi Premium Epoxy Systems",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
