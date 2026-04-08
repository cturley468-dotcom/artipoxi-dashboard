import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type BrandMarkProps = {
  href?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
};

export default function BrandMark({
  href = "/",
  subtitle = "Premium epoxy systems",
  size = "md",
}: BrandMarkProps) {
  const sizeClass =
    size === "sm" ? "text-2xl" : size === "lg" ? "text-4xl md:text-5xl" : "text-3xl";

  const subtitleClass =
    size === "sm" ? "text-[10px]" : size === "lg" ? "text-xs" : "text-[11px]";

  return (
    <Link href={href} className="inline-block">
      <div className={`${playfair.className} ${sizeClass} leading-none tracking-wide`}>
        <span className="text-cyan-300">Arti</span>
        <span className="text-white">Poxi</span>
      </div>

      <div className={`mt-1 uppercase tracking-[0.28em] text-zinc-500 ${subtitleClass}`}>
        {subtitle}
      </div>
    </Link>
  );
}
