import Link from "next/link";
import BrandMark from "./components/BrandMark";

const showcaseCards = [
  {
    title: "Garage / Shop",
    subtitle: "Decorative flake systems",
    value: "Premium finish",
  },
  {
    title: "Patio / Outdoor",
    subtitle: "Slip-resistant coatings",
    value: "Weather-ready",
  },
  {
    title: "Commercial",
    subtitle: "Durable traffic systems",
    value: "Professional grade",
  },
];

const featuredProjects = [
  {
    title: "Midnight Garage Floor",
    text: "Deep charcoal epoxy system with premium flake texture and a crisp modern finish.",
  },
  {
    title: "Stone Blend Patio",
    text: "Outdoor decorative coating built for traction, durability, and visual depth.",
  },
  {
    title: "Clean Shop Surface",
    text: "A performance coating designed to handle daily work while elevating the space.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <BrandMark href="/" subtitle="Premium epoxy systems" size="lg" />

          <div className="flex items-center gap-3">
            <a href="#projects" className="ui-btn hidden sm:inline-flex">
              View Projects
            </a>
            <Link href="/login" className="ui-btn ui-btn-primary">
              Secure Login
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <div className="section-kicker">ArtiPoxi Systems</div>
          <h1 className="page-title mt-4">
            Design your floor.
            <br />
            Run your project.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Explore premium epoxy systems, preview your floor direction, and move
            from inspiration to quote request with one clean interface.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/configurator" className="ui-btn ui-btn-primary">
              Open Configurator
            </Link>

            <a href="#projects" className="ui-btn">
              Explore Projects
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {showcaseCards.map((card) => (
              <div key={card.title} className="glass-panel-soft rounded-[24px] p-4">
                <div className="text-sm uppercase tracking-[0.22em] text-zinc-500">
                  {card.title}
                </div>
                <div className="mt-3 text-lg font-bold text-white">{card.value}</div>
                <div className="mt-2 text-sm text-zinc-400">{card.subtitle}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-frame p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="section-kicker">Live Preview</div>
              <div className="mt-2 text-3xl font-black tracking-tight">
                Midnight Flake Garage
              </div>
            </div>

            <div className="ui-chip ui-chip-cyan">Premium look</div>
          </div>

          <div className="preview-image grid-glow mt-6 rounded-[24px] p-5">
            <div className="grid h-full min-h-[430px] gap-5 lg:grid-cols-[0.42fr_0.58fr]">
              <div className="glass-panel-soft rounded-[24px] p-5">
                <div className="section-kicker">System Type</div>
                <div className="mt-4 space-y-4">
                  <PreviewSelector active label="Garage / Shop" />
                  <PreviewSelector label="Patio / Outdoor" />
                  <PreviewSelector label="Commercial Surface" />
                </div>

                <div className="mt-8">
                  <div className="section-kicker">Configuration</div>
                  <div className="mt-4 grid gap-3">
                    <MiniMetric label="Space" value="2-Car Garage" />
                    <MiniMetric label="Style" value="Decorative Flake" />
                    <MiniMetric label="Finish" value="High Gloss" />
                  </div>
                </div>
              </div>

              <div className="preview-floor flex rounded-[24px] border border-white/10 p-5">
                <div className="flex w-full flex-col justify-between rounded-[20px] border border-cyan-400/10 bg-black/20 p-5">
                  <div className="flex items-center justify-between">
                    <div className="ui-chip ui-chip-lime">Live surface preview</div>
                    <div className="ui-chip">Garage / Shop</div>
                  </div>

                  <div className="self-start rounded-[20px] border border-white/10 bg-black/30 px-5 py-4">
                    <div className="text-sm text-zinc-400">Suggested system</div>
                    <div className="mt-2 text-3xl font-black text-cyan-300">
                      Decorative Flake
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <MiniStep step="01" text="Choose space type" />
                    <MiniStep step="02" text="Select coating style" />
                    <MiniStep step="03" text="Request quote" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Link href="/configurator" className="ui-btn ui-btn-primary">
              View Quote Request
            </Link>
          </div>
        </div>
      </section>

      <section id="projects" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-2xl">
            <div className="section-kicker">Featured Projects</div>
            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Finishes built to stand out.
            </h2>
            <p className="mt-4 panel-subtitle">
              Strong design, premium surface performance, and a modern visual
              language that gives concrete a custom-built feel.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <div key={project.title} className="glass-panel-soft rounded-[28px] p-5">
                <div className="preview-floor h-56 rounded-[22px] border border-white/10" />
                <div className="mt-5 text-2xl font-bold">{project.title}</div>
                <div className="mt-3 leading-7 text-zinc-400">{project.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function PreviewSelector({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border px-4 py-4 ${
        active
          ? "border-cyan-400/22 bg-cyan-400/8 text-cyan-300"
          : "border-white/10 bg-white/[0.03] text-zinc-300"
      }`}
    >
      <div className="font-semibold">{label}</div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{label}</div>
      <div className="mt-2 text-lg font-bold text-white">{value}</div>
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
      <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
        Step {step}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{text}</div>
    </div>
  );
}
