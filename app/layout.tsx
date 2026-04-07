import "./globals.css";
import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";

export const metadata: Metadata = {
  title: "ArtiPoxi",
  description: "Operations Dashboard",
};

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
