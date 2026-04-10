import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArtiPoxi",
  description: "ArtiPoxi Premium Epoxy Systems",
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
