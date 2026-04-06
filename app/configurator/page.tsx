"use client";

import { useMemo, useState } from "react";

type SpaceType = "garage" | "patio" | "basement" | "interior";
type SystemType = "flake" | "metallic" | "solid";
type FinishType = "gloss" | "satin" | "matte";
type JobStatus =
  | "New"
  | "Quoted"
  | "Follow Up"
  | "Scheduled"
  | "In Progress"
  | "Completed";

type LeadJob = {
  id: string;
  name: string;
  customer: string;
  status: JobStatus;
  quotedPrice: number;
  materialsCost: number;
  laborCost: number;
  miscCost: number;
  beforePhotos?: string[];
  afterPhotos?: string[];
};

const STORAGE_KEY = "artipoxi_jobs";

const spaceOptions: { id: SpaceType; label: string; note: string }[] = [
  { id: "garage", label: "Garage", note: "Hot tire and daily-use durability" },
  { id: "patio", label: "Patio", note: "Outdoor-ready decorative finish" },
  { id: "basement", label: "Basement", note: "Clean, bright, durable surface" },
  { id: "interior", label: "Interior", note: "Modern residential coating" },
];

const systemOptions: {
  id: SystemType;
  label: string;
  price: number;
  note: string;
}[] = [
  { id: "flake", label: "Flake", price: 8, note: "Most popular, durable, decorative" },
  { id: "metallic", label: "Metallic", price: 10, note: "Premium designer finish" },
  { id: "solid", label: "Solid", price: 6, note: "Clean, simple, budget-friendly" },
];

const finishOptions: { id: FinishType; label: string; add: number }[] = [
  { id: "gloss", label: "Gloss", add: 0 },
  { id: "satin", label: "Satin", add: 0.5 },
  { id: "matte", label: "Matte", add: 0.75 },
];

const colorOptions = [
  "Midnight",
  "Storm Gray",
  "Arctic Blend",
  "Blue Steel",
  "Desert Sand",
  "Obsidian",
];

const colorMap: Record<string, string> = {
  Midnight: "#0f172a",
  "Storm Gray": "#4b5563",
  "Arctic Blend": "linear-gradient(135deg, #e5e7eb, #9ca3af)",
  "Blue Steel": "#3b82f6",
  "Desert Sand": "#d6b38c",
  Obsidian: "#111827",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ConfiguratorPage() {
  const [step, setStep] = useState(1);

  const [space, setSpace] = useState<SpaceType>("garage");
  const [sf, setSf] = useState(400);
  const [system, setSystem] = useState<SystemType>("flake");
  const [finish, setFinish] = useState<FinishType>("gloss");
  const [color, setColor] = useState("Midnight");

  const [slipResistant, setSlipResistant] = useState(false);
  const [crackRepair, setCrackRepair] = useState(false);
  const [uvProtection, setUvProtection] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const pricing = useMemo(() => {
    const basePerSf =
      systemOptions.find((option) => option.id === system)?.price ?? 8;

    const finishAdd =
      finishOptions.find((option) => option.id === finish)?.add ?? 0;

    let addOnsPerSf = 0;
    if (slipResistant) addOnsPerSf += 0.5;
    if (crackRepair) addOnsPerSf += 1.25;
    if (uvProtection) addOnsPerSf += 0.75;

    const totalPerSf = basePerSf + finishAdd + addOnsPerSf;
    const lowEstimate = Math.round(sf * totalPerSf);
    const highEstimate = Math.round(lowEstimate * 1.15);

    return { totalPerSf, lowEstimate, highEstimate };
  }, [system, finish, slipResistant, crackRepair, uvProtection, sf]);

  const progressPercent = (step / 5) * 100;

  function handleSaveLead() {
    const cleanName = fullName.trim();

    if (!cleanName) {
      setSubmitMessage("Please enter customer name.");
      return;
    }

    const baseJobName = `${cleanName.split(" ")[0]} ${capitalize(space)} Project`;
    const baseId = slugify(baseJobName);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? (JSON.parse(raw) as LeadJob[]) : [];

      let finalId = baseId;
      let counter = 2;

      while (existing.some((job) => job.id === finalId)) {
        finalId = `${baseId}-${counter}`;
        counter += 1;
      }

      const newLead: LeadJob = {
        id: finalId,
        name: baseJobName,
        customer: cleanName,
        status: "New",
        quotedPrice: pricing.highEstimate,
        materialsCost: Math.round(pricing.highEstimate * 0.23),
        laborCost: Math.round(pricing.highEstimate * 0.32),
        miscCost: Math.round(pricing.highEstimate * 0.04),
        beforePhotos: [],
        afterPhotos: [],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([newLead, ...existing]));
      setSubmitMessage("Lead saved to dashboard.");

      setFullName("");
      setPhone("");
      setEmail("");
    } catch {
      setSubmitMessage("Failed to save lead.");
    }
  }

  function resetConfigurator() {
    setStep(1);
    setSpace("garage");
    setSf(400);
    setSystem("flake");
    setFinish("gloss");
    setColor("Midnight");
    setSlipResistant(false);
    setCrackRepair(false);
    setUvProtection(false);
    setFullName("");
    setPhone("");
    setEmail("");
    setSubmitMessage("");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            ArtiPoxi
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Floor Configurator
          </h1>
          <p className="mt-3 text-zinc-400">
            Build a floor, estimate the project, and send the lead into your dashboard.
          </p>
        </div>

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
            <span>Step {step} of 5</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/10">
            <div
              className="h-3 rounded-full bg-cyan-400 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
            {step === 1 && (
              <section>
                <h2 className="text-2xl font-semibold">Choose your space</h2>
                <p className="mt-2 text-zinc-400">
                  Pick the type of area you want coated.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {spaceOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSpace(option.id)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        space === option.id
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="text-lg font-semibold">{option.label}</div>
                      <div className="mt-2 text-sm text-zinc-400">{option.note}</div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <h2 className="text-2xl font-semibold">Enter square footage</h2>
                <p className="mt-2 text-zinc-400">
                  Use a preset or type your own number.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {[250, 400, 600, 900].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSf(preset)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 hover:border-cyan-400/40"
                    >
                      {preset} SF
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="mb-2 block text-sm text-zinc-400">
                    Square Footage
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sf}
                    onChange={(e) => setSf(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-black outline-none"
                  />
                </div>
              </section>
            )}

            {step === 3 && (
              <section>
                <h2 className="text-2xl font-semibold">Choose your system</h2>
                <p className="mt-2 text-zinc-400">
                  Select the coating system that fits your space and budget.
                </p>

                <div className="mt-6 grid gap-4">
                  {systemOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSystem(option.id)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        system === option.id
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-lg font-semibold">{option.label}</div>
                        <div className="text-sm text-cyan-300">
                          From ${option.price}/SF
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-zinc-400">{option.note}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold">Color</h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {colorOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setColor(option)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                          color === option
                            ? "border-lime-400 bg-lime-400/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <div
                          className="h-5 w-5 rounded-full border border-white/20"
                          style={{ background: colorMap[option] }}
                        />
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold">Finish</h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {finishOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setFinish(option.id)}
                        className={`rounded-xl border px-4 py-2 transition ${
                          finish === option.id
                            ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {step === 4 && (
              <section>
                <h2 className="text-2xl font-semibold">Choose add-ons</h2>
                <p className="mt-2 text-zinc-400">
                  Add protective and prep options to improve the system.
                </p>

                <div className="mt-6 grid gap-4">
                  <ToggleCard
                    label="Slip Resistant"
                    note="Adds grip for safer footing"
                    checked={slipResistant}
                    onClick={() => setSlipResistant(!slipResistant)}
                  />
                  <ToggleCard
                    label="Crack Repair"
                    note="Repairs visible floor cracks before coating"
                    checked={crackRepair}
                    onClick={() => setCrackRepair(!crackRepair)}
                  />
                  <ToggleCard
                    label="UV Protection"
                    note="Adds extra protection for sun exposure"
                    checked={uvProtection}
                    onClick={() => setUvProtection(!uvProtection)}
                  />
                </div>
              </section>
            )}

            {step === 5 && (
              <section>
                <h2 className="text-2xl font-semibold">Your estimate</h2>
                <p className="mt-2 text-zinc-400">
                  Save this customer directly into your dashboard pipeline.
                </p>

                <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6">
                  <div className="text-sm text-zinc-400">Estimated Range</div>
                  <div className="mt-2 text-4xl font-bold text-cyan-300">
                    ${pricing.lowEstimate.toLocaleString()} - ${pricing.highEstimate.toLocaleString()}
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">
                    About ${pricing.totalPerSf.toFixed(2)}/SF
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/90 p-6 shadow-lg shadow-cyan-500/10">
                  <h3 className="mb-4 text-lg font-semibold text-white">
                    Customer Information
                  </h3>

                  <input
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mb-3 w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-black placeholder:text-zinc-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  />

                  <input
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mb-3 w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-black placeholder:text-zinc-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  />

                  <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-3 w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-black placeholder:text-zinc-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  />

                  <button
                    onClick={handleSaveLead}
                    className="mt-2 w-full rounded-xl bg-lime-400 py-3 font-semibold text-black hover:bg-lime-300"
                  >
                    Save Lead to Dashboard
                  </button>

                  {submitMessage && (
                    <p className="mt-3 text-sm text-cyan-300">{submitMessage}</p>
                  )}
                </div>
              </section>
            )}

            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                onClick={() => setStep((current) => Math.max(1, current - 1))}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/5"
              >
                Back
              </button>

              {step < 5 ? (
                <button
                  onClick={() => setStep((current) => Math.min(5, current + 1))}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-black hover:bg-cyan-300"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={resetConfigurator}
                  className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-semibold text-black hover:bg-lime-300"
                >
                  Start Over
                </button>
              )}
            </div>
          </div>

          <aside className="h-fit rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Live Summary</h2>

            <div className="mt-5 space-y-4 text-sm">
              <SummaryItem label="Space" value={capitalize(space)} />
              <SummaryItem label="SF" value={`${sf} SF`} />
              <SummaryItem label="System" value={capitalize(system)} />
              <SummaryItem label="Color" value={color} />
              <SummaryItem label="Finish" value={capitalize(finish)} />
            </div>

            <div className="mt-6 rounded-2xl border border-lime-400/20 bg-lime-400/5 p-4">
              <div className="text-sm text-zinc-400">Current Estimate</div>
              <div className="mt-1 text-2xl font-bold text-lime-300">
                ${pricing.lowEstimate.toLocaleString()} - ${pricing.highEstimate.toLocaleString()}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ToggleCard({
  label,
  note,
  checked,
  onClick,
}: {
  label: string;
  note: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        checked
          ? "border-lime-400 bg-lime-400/10"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="text-lg font-semibold">{label}</div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            checked
              ? "bg-lime-400/20 text-lime-300"
              : "bg-white/10 text-zinc-300"
          }`}
        >
          {checked ? "Selected" : "Optional"}
        </div>
      </div>
      <div className="mt-2 text-sm text-zinc-400">{note}</div>
    </button>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
      <span className="text-zinc-400">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}