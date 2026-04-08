"use client";

import Link from "next/link";
import Image from "next/image";

export default function BrandMark({
  href = "/",
  subtitle,
  size = "md",
}: {
  href?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <Link href={href} className="flex items-center gap-3 group">
      <div className={`relative ${sizes[size]}`}>
        <Image
          src="/branding/logo-icon.png"
          alt="ArtiPoxi"
          fill
          className="object-contain drop-shadow-[0_0_15px_rgba(0,200,255,0.6)] group-hover:scale-105 transition"
        />
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-white font-semibold tracking-wide text-sm">
          ArtiPoxi
        </span>
        {subtitle && (
          <span className="text-xs text-zinc-400">
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  );
}
