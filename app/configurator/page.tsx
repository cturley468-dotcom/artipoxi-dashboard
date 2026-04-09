"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BrandMark from "../components/BrandMark";

const steps = [
  "Space",
  "System",
  "Color",
  "Topcoat",
  "Summary",
] as const;

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

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

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
                    Preview a premium garage-style layout as you build.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <button onClick={prevStep} className="ui-btn" disabled={step === 0}>
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      className="ui-btn ui-btn-primary"
                      disabled={step === steps.length - 1}
                    >
                      {step === steps.length - 1 ? "Complete" : "Next Step"}
                    </button>
                  </div>
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
                  const complete = index < step;

                  return (
                    <button
                      key={item}
                      onClick={() => setStep(index)}
                      className={`step-rail-item ${active ? "step-rail-item-active" : ""}`}
                    >
                      <div className={`step-badge ${active ? "step-badge-active" : ""}`}>
                        {complete ? "✓" : index + 1}
                      </div>

                      <div className="min-w-0 text-left">
                        <div className="truncate text-base font-bold text-white">
                          {item}
                        </div>
                        <div className="mt-1 text-sm text-zinc-500">
                          Step {index + 1}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/25 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Current Selection
                </div>
                <div className="mt-3 text-lg font-bold text-white">
                  {steps[step]}
                </div>
                <div className="mt-2 text-sm leading-7 text-zinc-400">
                  Move step by step and refine the floor direction before
                  requesting a quote.
                </div>
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

                {step === 0 && (
                  <OptionSection
                    title="Choose your space"
                    subtitle="Start with the environment you want to transform."
                    options={spaceOptions}
                    activeId={space.id}
                    onSelect={(id) =>
                      setSpace(spaceOptions.find((option) => option.id === id) || spaceOptions[0])
                    }
                  />
                )}

                {step === 1 && (
                  <OptionSection
                    title="Choose your system"
                    subtitle="Select the overall finish style and surface character."
                    options={systemOptions}
                    activeId={system.id}
                    onSelect={(id) =>
                      setSystem(
                        systemOptions.find((option) => option.id === id) || systemOptions[0]
                      )
                    }
                  />
                )}

                {step === 2 && (
                  <OptionSection
                    title="Choose your color direction"
                    subtitle="Set the tone and movement of the finished floor."
                    options={colorOptions}
                    activeId={color.id}
                    onSelect={(id) =>
                      setColor(colorOptions.find((option) => option.id === id) || colorOptions[0])
                    }
                  />
                )}

                {step === 3 && (
                  <OptionSection
                    title="Choose your topcoat"
                    subtitle="Control the final surface feel and protection level."
                    options={topcoatOptions}
                    activeId={topcoat.id}
                    onSelect={(id) =>
                      setTopcoat(
                        topcoatOptions.find((option) => option.id === id) || topcoatOptions[0]
                      )
                    }
                  />
                )}

                {step === 4 && (
                  <section className="glass-panel-strong rounded-[28px] p-5 md:p-6">
                    <div className="section-kicker">Summary</div>
                    <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                      Your configured floor
                    </h2>
                    <p className="mt-3 max-w-2xl text-base leading-8 text-zinc-400">
                      Review your floor direction, then move into quote request
                      when you are ready.
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {summary.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[20px] border border-white/10 bg-black/30 p-4"
                        >
                          <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                            {item.label}
                          </div>
                          <div className="mt-3 text-lg font-bold text-white">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link href="/login" className="ui-btn">
                        Save For Later
                      </Link>
                      <a href="mailto:cameron@camspainting.co" className="ui-btn ui-btn-primary">
                        Request Quote
                      </a>
                    </div>
                  </section>
                )}
              </div>
            </section>
          </div>

          <div className="glass-panel-strong fixed bottom-3 left-3 right-3 z-40 rounded-[20px] p-3 xl:hidden">
            <div className="flex gap-3">
              <button onClick={prevStep} className="ui-btn flex-1" disabled={step === 0}>
                Back
              </button>
              {step < steps.length - 1 ? (
                <button onClick={nextStep} className="ui-btn ui-btn-primary flex-1">
                  Next
                </button>
              ) : (
                <a
                  href="mailto:cameron@camspainting.co"
                  className="ui-btn ui-btn-primary flex-1"
                >
                  Quote
                </a>
              )}
            </div>
          </div>

          <div className="h-24 xl:hidden" />
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
  options: {
    id: string;
    title: string;
    subtitle: string;
    description: string;
  }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="glass-panel-strong rounded-[28px] p-5 md:p-6">
      <div className="section-kicker">Configurator Step</div>
      <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-8 text-zinc-400">
        {subtitle}
      </p>

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

              <div className="mt-2 text-sm font-semibold text-zinc-300">
                {option.subtitle}
              </div>

              <div className="mt-3 text-sm leading-7 text-zinc-400">
                {option.description}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MiniCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-black/30 p-3">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}