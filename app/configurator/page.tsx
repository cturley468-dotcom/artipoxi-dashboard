"use client";

import { useMemo, useState } from "react";
import BrandMark from "../components/BrandMark";

const steps = [
  "Space Type",
  "Coating Style",
  "Finish Color",
  "Protection",
] as const;

const spaceTypes = ["Garage / Shop", "Patio / Outdoor", "Commercial"] as const;
const coatingStyles = ["Decorative Flake", "Solid Color", "Quartz System"] as const;
const finishColors = ["Midnight Blend", "Stone Blend", "Light Granite"] as const;
const protections = ["High Gloss", "Satin Finish", "UV Resistant"] as const;

export default function ConfiguratorPage() {
  const [step, setStep] = useState(0);
  const [spaceType, setSpaceType] = useState<(typeof spaceTypes)[number]>("Garage / Shop");
  const [coatingStyle, setCoatingStyle] = useState<(typeof coatingStyles)[number]>("Decorative Flake");
  const [finishColor, setFinishColor] = useState<(typeof finishColors)[number]>("Midnight Blend");
  const [protection, setProtection] = useState<(typeof protections)[number]>("High Gloss");

  const summary = useMemo(
    () => [
      { title: "Space", value: spaceType },
      { title: "Style", value: coatingStyle },
      { title: "Finish", value: finishColor },
      { title: "Protection", value: protection },
    ],
    [spaceType, coatingStyle, finishColor, protection]
  );

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-4 md:px-6 md:py-6">
        <div className="glass-panel cyber-outline rounded-[32px] p-4 md:p-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <BrandMark href="/" subtitle="Premium epoxy systems" size="md" />
              <div className="hidden h-14 w-px bg-white/10 md:block" />
              <div>
                <div className="text-3xl font-black tracking-tight">
                  Floor Configurator
                </div>
                <div className="mt-1 text-sm text-zinc-400">
                  Build your finish direction and request your quote.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="ui-btn">Save Preview</button>
              <button className="ui-btn ui-btn-primary">Request Quote</button>
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[280px_1fr]">
            <aside className="glass-panel-soft rounded-[28px] p-4">
              <div className="section-kicker">Configurator Steps</div>
              <div className="neon-line mt-3" />

              <div className="mt-5 space-y-3">
                {steps.map((item, index) => {
                  const active = index === step;
                  const complete = index < step;

                  return (
                    <button
                      key={item}
                      onClick={() => setStep(index)}
                      className={`step-rail-item w-full text-left ${
                        active ? "step-rail-item-active" : ""
                      }`}
                    >
                      <div
                        className={`step-badge ${
                          active ? "step-badge-active" : ""
                        }`}
                      >
                        {complete ? "✓" : index + 1}
                      </div>

                      <div>
                        <div
                          className={`text-base font-bold ${
                            active ? "text-cyan-300" : "text-white"
                          }`}
                        >
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

              <button
                onClick={nextStep}
                className="ui-btn ui-btn-primary mt-6 w-full"
              >
                Next: {steps[Math.min(step + 1, steps.length - 1)]}
              </button>
            </aside>

            <section className="space-y-5">
              <div className="preview-frame p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="section-kicker">Live Preview</div>
                    <div className="mt-2 text-3xl font-black tracking-tight">
                      {spaceType}
                    </div>
                  </div>

                  <div className="ui-chip ui-chip-cyan">{steps[step]}</div>
                </div>

                <div className="preview-image mt-5 rounded-[26px] p-5">
                  <div className="grid h-full min-h-[440px] gap-5 lg:grid-cols-[0.38fr_0.62fr]">
                    <div className="glass-panel-soft rounded-[22px] p-5">
                      <div className="section-kicker">Selected Options</div>

                      <div className="mt-5 space-y-4">
                        {summary.map((item) => (
                          <div
                            key={item.title}
                            className="rounded-[18px] border border-white/10 bg-black/25 p-4"
                          >
                            <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                              {item.title}
                            </div>
                            <div className="mt-2 text-xl font-bold text-white">
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="preview-floor rounded-[22px] border border-white/10 p-5">
                      <div className="grid h-full grid-rows-[auto_1fr_auto] gap-4 rounded-[18px] border border-cyan-400/10 bg-black/20 p-5">
                        <div className="flex items-center justify-between">
                          <div className="ui-chip">Preview Surface</div>
                          <div className="ui-chip ui-chip-lime">{protection}</div>
                        </div>

                        <div className="flex items-end">
                          <div className="rounded-[18px] border border-white/10 bg-black/30 px-5 py-4">
                            <div className="text-sm text-zinc-400">Configured look</div>
                            <div className="mt-2 text-3xl font-black neon-text">
                              {coatingStyle}
                            </div>
                            <div className="mt-2 text-zinc-300">{finishColor}</div>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <MiniStep step="01" text={spaceType} />
                          <MiniStep step="02" text={coatingStyle} />
                          <MiniStep step="03" text={protection} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel-soft rounded-[28px] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="panel-title">{steps[step]}</div>
                    <div className="panel-subtitle mt-2">
                      Configure your surface system one step at a time.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={prevStep} className="ui-btn">
                      Back
                    </button>
                    <button onClick={nextStep} className="ui-btn ui-btn-primary">
                      Continue
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  {step === 0 && (
                    <OptionGrid
                      options={spaceTypes}
                      value={spaceType}
                      onChange={(value) => setSpaceType(value as (typeof spaceTypes)[number])}
                    />
                  )}

                  {step === 1 && (
                    <OptionGrid
                      options={coatingStyles}
                      value={coatingStyle}
                      onChange={(value) =>
                        setCoatingStyle(value as (typeof coatingStyles)[number])
                      }
                    />
                  )}

                  {step === 2 && (
                    <OptionGrid
                      options={finishColors}
                      value={finishColor}
                      onChange={(value) =>
                        setFinishColor(value as (typeof finishColors)[number])
                      }
                    />
                  )}

                  {step === 3 && (
                    <OptionGrid
                      options={protections}
                      value={protection}
                      onChange={(value) =>
                        setProtection(value as (typeof protections)[number])
                      }
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function OptionGrid({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {options.map((option) => {
        const active = option === value;

        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-[22px] border p-5 text-left transition ${
              active
                ? "border-cyan-400/28 bg-cyan-400/10 shadow-[0_0_26px_rgba(73,230,255,0.08)]"
                : "border-white/10 bg-white/[0.03] hover:border-cyan-400/18"
            }`}
          >
            <div
              className={`text-lg font-bold ${
                active ? "text-cyan-300" : "text-white"
              }`}
            >
              {option}
            </div>
            <div className="mt-2 text-sm text-zinc-400">
              Click to preview this option in the live layout.
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MiniStep({
  step,
  text,
}: {
  step: string;
  text: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        Step {step}
      </div>
      <div className="mt-2 text-sm font-medium text-white">{text}</div>
    </div>
  );
}