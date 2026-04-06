import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArtiPoxi",
  description:
    "Premium epoxy flooring quotes, job tracking, lead pipeline, and inventory management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}