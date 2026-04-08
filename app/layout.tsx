import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArtiPoxi",
  description: "Premium epoxy systems and operations platform",
  icons: {
    icon: "/branding/logo-icon.png",
    shortcut: "/branding/logo-icon.png",
    apple: "/branding/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
