"use client";

import Link from "next/link";
import Image from "next/image";

export default function BrandMark({
  href = "/",
  subtitle,
  size = "md",
  stacked = false,
}: {
  href?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  stacked?: boolean;
}) {
  const iconSize =
    size === "sm" ? 36 : size === "lg" ? 52 : 44;

  const titleClass =
    size === "sm"
      ? "text-lg"
      : size === "lg"
      ? "text-2xl"
      : "text-xl";

  const subtitleClass =
    size === "sm" ? "text-xs" : "text-sm";

  return (
    <Link
      href={href}
      className={`group inline-flex ${
        stacked ? "flex-col items-start gap-3" : "items-center gap-3"
      }`}
    >
      <div className="relative shrink-0">
        <div
          className="absolute inset-0 rounded-[18px] bg-cyan-400/10 blur-xl transition duration-300 group-hover:bg-cyan-400/20"
          aria-hidden="true"
        />
        <div className="relative flex items-center justify-center rounded-[18px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(10,18,30,0.96),rgba(6,10,18,0.96))] p-2 shadow-[0_0_22px_rgba(73,230,255,0.10)]">
          <Image
            src="/branding/logo-icon.png"
            alt="ArtiPoxi"
            width={iconSize}
            height={iconSize}
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="min-w-0">
        <div
          className={`${titleClass} truncate font-black tracking-[-0.03em] text-white`}
        >
          ArtiPoxi
        </div>
        {subtitle ? (
          <div
            className={`${subtitleClass} mt-0.5 truncate uppercase tracking-[0.22em] text-zinc-500`}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
