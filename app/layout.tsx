import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArtiPoxi",
  description: "Premium epoxy systems and operations platform",
  icons: {
    icon: "/branding/app-icon.png",
    shortcut: "/branding/app-icon.png",
    apple: "/branding/app-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#060708" />
      </head>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
