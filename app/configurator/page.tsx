"use client";

import { useMemo, useState } from "react";

const steps = [
  "Space Type",
  "Coating Style",
  "Color Blend",
  "Topcoat",
] as const;

const spaceTypes = [
  "Garage / Shop",
  "Patio / Outdoor",
  "Commercial",
] as const;

const coatingStyles = [
  "Decorative Flake",
  "Solid Color",
  "Quartz System",
] as const;

const colorBlends = [
  "Midnight Blend",
  "Stone Blend",
  "Light Granite",
] as const;

const topcoats = [
  "High Gloss",
  "Satin Finish",
  "UV Resistant",
] as const;

export default function ConfiguratorPage() {
  const [step, setStep] = useState(0);

  const [spaceType, setSpaceType] =
    useState<(typeof spaceTypes)[number]>("Garage / Shop");
  const [coatingStyle, setCoatingStyle] =
    useState<(typeof coatingStyles)[number]>("Decorative Flake");
  const [colorBlend, setColorBlend] =
    useState<(typeof colorBlends)[number]>("Midnight Blend");
  const [topcoat, setTopcoat] =
    useState<(typeof topcoats)[number]>("High Gloss");

  const summary = useMemo(
    () => [
      { label: "Space", value: spaceType },
      { label: "Style", value: coatingStyle },
      { label: "Color", value: colorBlend },
      { label: "Finish", value: topcoat },
    ],
    [spaceType, coatingStyle, colorBlend, topcoat]
  );

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  const activeStepName = steps[step];

  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        <section className="glass-panel-soft rounded-[28px] p-5 md:p-6">
          <div className="section-kicker">Configurator</div>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Design Your Floor
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                Build a premium epoxy system preview step by step. This version is
                simplified for phone first, then expands cleanly on desktop.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="ui-chip ui-chip-cyan">{activeStepName}</span>
              <span className="ui-chip">
                Step {step + 1} / {steps.length}
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <div className="glass-panel-soft rounded-[28px] p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="panel-title">{steps[step]}</div>
                  <div className="panel-subtitle mt-1 text-sm">
                    Choose one option to update the live preview.
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {step === 0 &&
                  spaceTypes.map((option) => (
                    <OptionCard
                      key={option}
                      label={option}
                      active={spaceType === option}
                      onClick={() => setSpaceType(option)}
                    />
                  ))}

                {step === 1 &&
                  coatingStyles.map((option) => (
                    <OptionCard
                      key={option}
                      label={option}
                      active={coatingStyle === option}
                      onClick={() => setCoatingStyle(option)}
                    />
                  ))}

                {step === 2 &&
                  colorBlends.map((option) => (
                    <OptionCard
                      key={option}
                      label={option}
                      active={colorBlend === option}
                      onClick={() => setColorBlend(option)}
                    />
                  ))}

                {step === 3 &&
                  topcoats.map((option) => (
                    <OptionCard
                      key={option}
                      label={option}
                      active={topcoat === option}
                      onClick={() => setTopcoat(option)}
                    />
                  ))}
              </div>
            </div>

            <div className="preview-frame p-4 md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="section-kicker">Live Preview</div>
                  <div className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                    {spaceType}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="ui-chip">{coatingStyle}</span>
                  <span className="ui-chip ui-chip-lime">{topcoat}</span>
                </div>
              </div>

              <div className="preview-image mt-5 rounded-[24px] p-4 md:p-5">
                <div className="flex min-h-[280px] flex-col justify-between rounded-[20px] border border-cyan-400/10 bg-black/20 p-4 md:min-h-[380px] md:p-5">
                  <div className="flex items-center justify-between">
                    <span className="ui-chip">Configured Surface</span>
                    <span className="ui-chip ui-chip-cyan">{colorBlend}</span>
                  </div>

                  <div className="self-start rounded-[18px] border border-white/10 bg-black/35 px-4 py-4 md:px-5">
                    <div className="text-sm text-zinc-400">Selected system</div>
                    <div className="mt-2 text-2xl font-black text-cyan-300 md:text-3xl">
                      {coatingStyle}
                    </div>
                    <div className="mt-2 text-sm text-zinc-300 md:text-base">
                      {spaceType} • {colorBlend} • {topcoat}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    {summary.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[16px] border border-white/10 bg-white/[0.04] p-3"
                      >
                        <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                          {item.label}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="glass-panel-soft rounded-[28px] p-4 md:p-5 xl:sticky xl:top-6 xl:self-start">
            <div className="section-kicker">Selections</div>
            <div className="mt-3 panel-title">Project Summary</div>
            <div className="panel-subtitle mt-2 text-sm">
              Review your choices before moving toward quote request.
            </div>

            <div className="mt-5 space-y-3">
              {summary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[18px] border border-white/10 bg-black/20 p-4"
                >
                  <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    {item.label}
                  </div>
                  <div className="mt-2 text-base font-bold text-white">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[18px] border border-cyan-400/10 bg-cyan-400/5 p-4">
              <div className="text-sm text-zinc-400">Suggested direction</div>
              <div className="mt-2 text-lg font-bold text-cyan-300">
                Premium custom epoxy system
              </div>
            </div>

            <div className="mt-5 hidden xl:flex xl:flex-col xl:gap-3">
              <button
                onClick={prevStep}
                disabled={step === 0}
                className="ui-btn w-full disabled:opacity-50"
              >
                Back
              </button>

              <button
                onClick={nextStep}
                disabled={step === steps.length - 1}
                className="ui-btn ui-btn-primary w-full disabled:opacity-50"
              >
                Next Step
              </button>

              <button className="ui-btn ui-btn-lime w-full">
                Request Quote
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#070b12]/95 p-3 backdrop-blur xl:hidden">
        <div className="mx-auto flex max-w-7xl gap-3">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="ui-btn flex-1 disabled:opacity-50"
          >
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="ui-btn ui-btn-primary flex-1"
            >
              Next
            </button>
          ) : (
            <button className="ui-btn ui-btn-lime flex-1">
              Request Quote
            </button>
          )}
        </div>
      </div>

      <div className="h-24 xl:hidden" />
    </div>
  );
}

function OptionCard({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[22px] border p-4 text-left transition md:p-5 ${
        active
          ? "border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_20px_rgba(73,230,255,0.08)]"
          : "border-white/10 bg-black/20 hover:border-cyan-400/20 hover:bg-white/[0.03]"
      }`}
    >
      <div
        className={`text-base font-bold md:text-lg ${
          active ? "text-cyan-300" : "text-white"
        }`}
      >
        {label}
      </div>
      <div className="mt-2 text-sm leading-6 text-zinc-400">
        Tap to preview this option in the configured system.
      </div>
    </button>
  );
}
