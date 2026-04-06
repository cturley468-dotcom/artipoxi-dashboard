import Link from "next/link";

const services = [
  {
    title: "Garage Epoxy",
    description:
      "Premium garage floor coatings built for durability, style, and easy maintenance.",
  },
  {
    title: "Residential Floors",
    description:
      "Modern epoxy finishes for basements, patios, laundry rooms, and interior spaces.",
  },
  {
    title: "Commercial Growth",
    description:
      "Built to scale into larger commercial work as ArtiPoxi grows.",
  },
];

const stats = [
  { label: "Modern Designs", value: "100+" },
  { label: "Project Tracking", value: "Built In" },
  { label: "Quote Experience", value: "Fast" },
];

const steps = [
  "Choose your space",
  "Enter square footage",
  "Select color & finish",
  "Get your estimate",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,212,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(57,255,20,0.12),transparent_24%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-300">
              ArtiPoxi • Premium Epoxy Flooring
            </div>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Design Your Floor.
              <span className="block bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">
                Run Your Projects.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
              ArtiPoxi combines premium epoxy flooring quotes with job tracking,
              costing, photo uploads, and inventory tools — all in one clean,
              modern system.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/configurator"
                className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:scale-[1.02] hover:bg-cyan-300 text-center"
              >
                Design My Floor
              </Link>

              <Link
                href="/dashboard"
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:border-cyan-400/40 hover:bg-white/10 text-center"
              >
                Open Dashboard
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="text-2xl font-bold text-cyan-300">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-zinc-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-xl">
            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-4 shadow-2xl shadow-cyan-500/10">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">ArtiPoxi Visualizer</p>
                    <h2 className="text-xl font-semibold">
                      Floor Builder Preview
                    </h2>
                  </div>
                  <div className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs text-lime-300">
                    Live Preview
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#1f2937,#111827,#0a0a0a)] p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <PreviewBox label="Space" value="2-Car Garage" />
                    <PreviewBox label="Square Footage" value="400 SF" />
                    <PreviewBox label="Color Blend" value="Midnight Flake" />
                    <PreviewBox label="Finish" value="High Gloss" />
                  </div>

                  <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                    <div className="text-sm text-zinc-400">Estimated Range</div>
                    <div className="mt-1 text-2xl font-bold text-cyan-300">
                      $3,200 – $4,100
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  {steps.map((step, index) => (
                    <div
                      key={step}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"
                    >
                      <div className="text-xs text-cyan-300">Step {index + 1}</div>
                      <div className="mt-1 text-xs text-zinc-300">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Services
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Built for modern epoxy flooring businesses
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Give customers a premium quote experience while managing projects,
            margins, and materials behind the scenes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10"
            >
              <div className="mb-4 h-40 rounded-2xl bg-gradient-to-br from-cyan-400/20 via-zinc-800 to-lime-400/10" />
              <h3 className="text-xl font-semibold transition group-hover:text-cyan-300">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-lime-300">
                Why it works
              </p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                A contractor brand with a real operating system behind it
              </h2>
              <p className="mt-4 max-w-xl text-zinc-400">
                ArtiPoxi is not just a website. It is a full workflow:
                configurator, lead pipeline, job cards, financial tracking, and
                inventory management.
              </p>

              <ul className="mt-6 space-y-3 text-zinc-300">
                <li>• Modern dark theme with premium glow accents</li>
                <li>• Customer-friendly quote builder</li>
                <li>• Job costing and profit tracking</li>
                <li>• Photo uploads and project documentation</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="rounded-2xl border border-white/10 bg-black p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-zinc-400">Business Flow</div>
                    <div className="mt-1 text-xl font-semibold">
                      Lead to Job Card
                    </div>
                  </div>
                  <div className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                    Connected
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    "Customer builds quote",
                    "Lead enters dashboard",
                    "Job gets scheduled",
                    "Cost and profit tracked",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400/10 font-bold text-lime-300">
                        {index + 1}
                      </div>
                      <div className="text-zinc-200">{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-400/10 via-zinc-900 to-lime-400/10 p-8 sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Ready to Build
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Run ArtiPoxi like a real system
            </h2>
            <p className="mt-4 text-zinc-300">
              Use the configurator to generate leads, then move into the
              dashboard to manage jobs, costs, photos, and materials.
            </p>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/configurator"
                className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:bg-cyan-300 text-center"
              >
                Open Configurator
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10 text-center"
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PreviewBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}