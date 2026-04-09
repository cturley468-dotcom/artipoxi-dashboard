"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BrandMark from "../components/BrandMark";

const steps = ["Space", "System", "Color", "Topcoat", "Summary"] as const;

const spaceOptions = [
  {
    id: "garage",
    title: "Garage",
    subtitle: "Premium residential finish",
    description: "Built for clean, high-end garage transformations.",
  },
  {
    id: "shop",
    title: "Shop / Workspace",
    subtitle: "Heavy-duty surface",
    description: "Strong enough for daily work, clean enough to impress.",
  },
  {
    id: "patio",
    title: "Patio / Outdoor",
    subtitle: "Weather-ready system",
    description: "Slip-conscious finish for exterior spaces.",
  },
];

const systemOptions = [
  {
    id: "flake",
    title: "Decorative Flake",
    subtitle: "Most popular",
    description: "Strong visual texture with a premium finished look.",
  },
  {
    id: "solid",
    title: "Solid Color",
    subtitle: "Clean minimal style",
    description: "Smooth modern look with a simpler finish profile.",
  },
  {
    id: "quartz",
    title: "Quartz System",
    subtitle: "Commercial strength",
    description: "Heavy-duty appearance with extra surface character.",
  },
];

const colorOptions = [
  {
    id: "black-resin",
    title: "Black Resin",
    subtitle: "Dark luxury",
    description: "Deep black epoxy movement with silver contrast.",
  },
  {
    id: "storm-gray",
    title: "Storm Gray",
    subtitle: "Modern clean",
    description: "Balanced gray tone for a softer industrial finish.",
  },
  {
    id: "graphite-silver",
    title: "Graphite Silver",
    subtitle: "High contrast",
    description: "Sharp metallic feel with bold premium character.",
  },
];

const topcoatOptions = [
  {
    id: "gloss",
    title: "High Gloss",
    subtitle: "Reflective finish",
    description: "Maximum shine and a more dramatic finished look.",
  },
  {
    id: "satin",
    title: "Satin",
    subtitle: "Controlled sheen",
    description: "Cleaner, softer look with less reflection.",
  },
  {
    id: "uv",
    title: "UV Resistant",
    subtitle: "Added protection",
    description: "Extra protection for long-term performance.",
  },
];

export default function ConfiguratorPage() {
  const [step, setStep] = useState(0);
  const [space, setSpace] = useState(spaceOptions[0]);
  const [system, setSystem] = useState(systemOptions[0]);
  const [color, setColor] = useState(colorOptions[0]);
  const [topcoat, setTopcoat] = useState(topcoatOptions[0]);

  const summary = useMemo(
    () => [
      { label: "Space", value: space.title },
      { label: "System", value: system.title },
      { label: "Color", value: color.title },
      { label: "Topcoat", value: topcoat.title },
    ],
    [space, system, color, topcoat]
  );

  return (
    <main className="page-shell min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col gap-6">
          <section className="hero-garage p-5 md:p-8">
            <div className="flex h-full flex-col justify-between gap-8">
              <div className="flex items-start justify-between gap-4">
                <div className="glass-panel-soft rounded-[22px] px-4 py-3">
                  <BrandMark href="/" subtitle="Premium Epoxy Systems" size="sm" />
                </div>

                <div className="hidden sm:flex">
                  <span className="ui-chip ui-chip-silver">Interactive Preview</span>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr] xl:items-end">
                <div>
                  <div className="section-kicker">Floor Configurator</div>
                  <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
                    Build your
                    <br />
                    perfect floor.
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
                    Choose your space, system style, color direction, and finish.
                    Preview a premium garage-style direction as you build.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {summary.map((item) => (
                    <MiniCard key={item.label} title={item.label} value={item.value} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="glass-panel-soft hidden rounded-[28px] p-4 xl:block">
              <div className="section-kicker">Build Steps</div>
              <div className="mt-4 space-y-3">
                {steps.map((item, index) => {
                  const active = index === step;
                  return (
                    <button
                      key={item}
                      onClick={() => setStep(index)}
                      className={`step-rail-item ${active ? "step-rail-item-active" : ""}`}
                    >
                      <div className={`step-badge ${active ? "step-badge-active" : ""}`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="truncate text-base font-bold text-white">{item}</div>
                        <div className="mt-1 text-sm text-zinc-500">Step {index + 1}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="min-w-0">
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
                {steps.map((item, index) => {
                  const active = index === step;
                  return (
                    <button
                      key={item}
                      onClick={() => setStep(index)}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-zinc-300"
                      }`}
                    >
                      {index + 1}. {item}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-6">
                <section className="preview-frame">
                  <div className="preview-image min-h-[320px] p-4 md:min-h-[470px] md:p-6">
                    <div className="flex h-full flex-col justify-between gap-5 rounded-[24px] border border-white/10 bg-black/40 p-4 backdrop-blur md:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="section-kicker">Live Preview</div>
                          <div className="mt-2 text-2xl font-black tracking-tight md:text-4xl">
                            {space.title}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="ui-chip">{system.title}</span>
                          <span className="ui-chip ui-chip-silver">{topcoat.title}</span>
                        </div>
                      </div>

                      <div className="self-start rounded-[24px] border border-white/10 bg-black/45 p-4 md:max-w-[360px] md:p-5">
                        <div className="text-sm text-zinc-400">Selected finish</div>
                        <div className="mt-2 text-2xl font-black text-white md:text-3xl">
                          {color.title}
                        </div>
                        <div className="mt-2 text-sm leading-6 text-zinc-300">
                          {color.description}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-4">
                        {summary.map((item) => (
                          <MiniCard key={item.label} title={item.label} value={item.value} />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <OptionSection
                  title={`Choose your ${steps[step].toLowerCase()}`}
                  subtitle="Select the option that best matches your intended floor direction."
                  options={
                    step === 0
                      ? spaceOptions
                      : step === 1
                      ? systemOptions
                      : step === 2
                      ? colorOptions
                      : topcoatOptions
                  }
                  activeId={
                    step === 0
                      ? space.id
                      : step === 1
                      ? system.id
                      : step === 2
                      ? color.id
                      : topcoat.id
                  }
                  onSelect={(id) => {
                    if (step === 0) setSpace(spaceOptions.find((o) => o.id === id) || spaceOptions[0]);
                    if (step === 1) setSystem(systemOptions.find((o) => o.id === id) || systemOptions[0]);
                    if (step === 2) setColor(colorOptions.find((o) => o.id === id) || colorOptions[0]);
                    if (step === 3) setTopcoat(topcoatOptions.find((o) => o.id === id) || topcoatOptions[0]);
                  }}
                />

                {step === 4 ? (
                  <section className="glass-panel-strong rounded-[28px] p-5 md:p-6">
                    <div className="section-kicker">Summary</div>
                    <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                      Your configured floor
                    </h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {summary.map((item) => (
                        <div key={item.label} className="rounded-[20px] border border-white/10 bg-black/30 p-4">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                            {item.label}
                          </div>
                          <div className="mt-3 text-lg font-bold text-white">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link href="/login" className="ui-btn">Save For Later</Link>
                      <a href="mailto:cameron@camspainting.co" className="ui-btn ui-btn-primary">
                        Request Quote
                      </a>
                    </div>
                  </section>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function OptionSection({
  title,
  subtitle,
  options,
  activeId,
  onSelect,
}: {
  title: string;
  subtitle: string;
  options: { id: string; title: string; subtitle: string; description: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="glass-panel-strong rounded-[28px] p-5 md:p-6">
      <div className="section-kicker">Configurator Step</div>
      <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-8 text-zinc-400">{subtitle}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const active = option.id === activeId;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`rounded-[24px] border p-5 text-left transition ${
                active
                  ? "border-white/20 bg-white/10"
                  : "border-white/10 bg-black/25 hover:border-white/16 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-bold text-white">{option.title}</div>
                {active ? <span className="ui-chip ui-chip-silver">Selected</span> : null}
              </div>
              <div className="mt-2 text-sm font-semibold text-zinc-300">{option.subtitle}</div>
              <div className="mt-3 text-sm leading-7 text-zinc-400">{option.description}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-black/30 p-3">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{title}</div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
