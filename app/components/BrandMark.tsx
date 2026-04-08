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
  const iconSize = size === "sm" ? 28 : size === "lg" ? 42 : 34;
  const boxSize = size === "sm" ? "h-12 w-12" : size === "lg" ? "h-16 w-16" : "h-14 w-14";
  const titleClass =
    size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <Link href={href} className="flex min-w-0 items-center gap-3">
      <div
        className={`relative ${boxSize} shrink-0 rounded-[18px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(10,18,30,0.96),rgba(6,10,18,0.96))] shadow-[0_0_22px_rgba(73,230,255,0.10)]`}
      >
        <div className="absolute inset-0 rounded-[18px] bg-cyan-400/10 blur-xl" />
        <div className="relative flex h-full w-full items-center justify-center">
          <Image
            src="/branding/logo-icon.png"
            alt="ArtiPoxi"
            width={iconSize}
            height={iconSize}
            className="object-contain"
            priority
            unoptimized
          />
        </div>
      </div>

      <div className="min-w-0">
        <div className={`${titleClass} truncate font-black tracking-[-0.03em] text-white`}>
          ArtiPoxi
        </div>

        {subtitle ? (
          <div className="hidden truncate text-[11px] uppercase tracking-[0.22em] text-zinc-500 sm:block">
            {subtitle}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
