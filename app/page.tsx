import Link from "next/link";

const systems = [
  {
    title: "Garage Floor Systems",
    text: "Premium epoxy and polyaspartic finishes designed for durability, clean style, and long-term performance.",
  },
  {
    title: "Patio & Outdoor Coatings",
    text: "Slip-resistant, weather-ready surfaces that upgrade curb appeal and hold up to everyday use.",
  },
  {
    title: "Commercial Floors",
    text: "Professional-grade systems for shops, workspaces, and customer-facing environments.",
  },
];

const featuredProjects = [
  {
    title: "Midnight Garage Finish",
    subtitle: "High-gloss flake system",
    text: "A bold black base with premium flake texture for a clean showroom-style garage.",
  },
  {
    title: "Stone Blend Patio",
    subtitle: "Outdoor decorative system",
    text: "A durable exterior finish built for visual impact, traction, and long-term wear resistance.",
  },
  {
    title: "Modern Shop Floor",
    subtitle: "Commercial performance coating",
    text: "Built for heavy use with a clean finish that keeps the workspace looking sharp.",
  },
];

const benefits = [
  "Premium finish options",
  "Built for long-term durability",
  "Cleaner, easier-to-maintain surfaces",
  "Modern design-focused systems",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-3xl font-black tracking-tight text-cyan-300">
              ArtiPoxi
            </div>
            <div className="text-sm text-zinc-400">
              Premium epoxy floors, projects, and custom finish systems
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#projects"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/30 sm:inline-flex"
            >
              Projects
            </a>

            <a
              href="#systems"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/30 sm:inline-flex"
            >
              Systems
            </a>

            <Link
              href="/login"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Premium Epoxy Design
          </p>

          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Floors that look
            <br />
            as strong as they perform.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            ArtiPoxi creates premium epoxy flooring systems for garages, patios,
            shops, and custom spaces — designed to turn everyday concrete into a
            cleaner, bolder, more durable finish.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:opacity-90"
            >
              View Projects
            </a>

            <a
              href="#configurator"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:border-cyan-400/30"
            >
              Explore Configurator
            </a>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {benefits.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-zinc-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-neutral-900 p-5 shadow-2xl">
          <div className="rounded-[24px] border border-cyan-400/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.12),transparent_30%),#0a0a0a] p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                  Featured System
                </div>
                <div className="mt-2 text-2xl font-bold text-white">
                  Midnight Flake Garage
                </div>
              </div>

              <div className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-300">
                Popular
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <PreviewCard title="Space" value="2-Car Garage" />
              <PreviewCard title="Look" value="Midnight Flake" />
              <PreviewCard title="Finish" value="High Gloss" />
              <PreviewCard title="Style" value="Modern Premium" />
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
              <div className="text-sm text-zinc-400">Ideal For</div>
              <div className="mt-2 text-3xl font-black text-cyan-300">
                Garage Upgrades
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniStep step="01" text="Choose your finish" />
              <MiniStep step="02" text="Preview the system" />
              <MiniStep step="03" text="Request your quote" />
            </div>
          </div>
        </div>
      </section>

      <section
        id="projects"
        className="border-t border-white/10 bg-neutral-950/60"
      >
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Featured Projects
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Finishes built to stand out.
            </h2>
            <p className="mt-4 text-zinc-400">
              Explore the kind of surfaces ArtiPoxi is designed to create —
              bold, clean, durable, and built to elevate the space.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <div
                key={project.title}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                <div className="h-56 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.12),transparent_25%),linear-gradient(135deg,#0b0b0b,#151515)]" />
                <div className="p-6">
                  <div className="text-sm uppercase tracking-[0.22em] text-cyan-300">
                    {project.subtitle}
                  </div>
                  <h3 className="mt-3 text-2xl font-bold">{project.title}</h3>
                  <p className="mt-4 leading-7 text-zinc-400">{project.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="systems" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {systems.map((system) => (
              <div
                key={system.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-2xl font-bold">{system.title}</h3>
                <p className="mt-4 leading-7 text-zinc-400">{system.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="configurator" className="border-t border-white/10 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
                Configurator
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight">
                Start with the look you want.
              </h2>
              <p className="mt-4 max-w-xl text-zinc-400">
                Use the configurator to explore system styles, finish direction,
                and premium options before requesting a quote.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/configurator"
                  className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:opacity-90"
                >
                  Open Configurator
                </Link>

                <a
                  href="#contact"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:border-cyan-400/30"
                >
                  Request Pricing
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-neutral-900 p-5">
              <div className="rounded-[24px] border border-cyan-400/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.12),transparent_30%),#0a0a0a] p-6">
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                  Preview Builder
                </div>
                <div className="mt-2 text-2xl font-bold text-white">
                  Custom Floor Preview
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <PreviewCard title="Space Type" value="Garage / Shop" />
                  <PreviewCard title="Color Profile" value="Dark Modern Blend" />
                  <PreviewCard title="Coating Style" value="Decorative Flake" />
                  <PreviewCard title="Protection" value="Premium Topcoat" />
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm text-zinc-400">Why use it</div>
                  <div className="mt-2 text-zinc-200">
                    Preview system direction before installation and build a more
                    confident quote request.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Contact
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Let’s build your next floor.
            </h2>

            <p className="mt-4 max-w-2xl text-zinc-400">
              Ready to price a new project or get access to your existing one?
              Reach out for quote requests, customer updates, or secure portal access.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="mailto:cameron@camspainting.co"
                className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:opacity-90"
              >
                Email ArtiPoxi
              </a>

              <Link
                href="/login"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:border-cyan-400/30"
              >
                Secure Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PreviewCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        Step {step}
      </div>
      <div className="mt-2 text-sm font-medium text-white">{text}</div>
    </div>
  );
}