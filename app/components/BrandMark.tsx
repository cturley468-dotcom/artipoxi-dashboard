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
  const wrap =
    size === "sm"
      ? "h-11 w-11 rounded-[14px]"
      : size === "lg"
      ? "h-16 w-16 rounded-[20px]"
      : "h-14 w-14 rounded-[18px]";

  const titleClass =
    size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <Link href={href} className="flex min-w-0 items-center gap-3">
      <div
        className={`glass-panel-soft ${wrap} relative flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-black/40`}
      >
        <Image
          src="/branding/logo-icon.png"
          alt="ArtiPoxi"
          width={64}
          height={64}
          className="h-full w-full object-cover"
          priority
        />
      </div>

      <div className="min-w-0">
        <div className={`${titleClass} truncate font-black tracking-[-0.03em] text-white`}>
          ArtiPoxi
        </div>

        {subtitle ? (
          <div className="mt-0.5 truncate text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            {subtitle}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
