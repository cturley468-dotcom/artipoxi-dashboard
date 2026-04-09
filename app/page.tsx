import Link from "next/link";
import BrandMark from "./components/BrandMark";

const highlights = [
  { value: "Premium", label: "Finish Quality" },
  { value: "Custom", label: "Epoxy Systems" },
  { value: "Built", label: "To Last" },
];

const systems = [
  {
    title: "Garage Floors",
    text: "Premium epoxy floor systems designed to transform garages into clean, durable, high-end finished spaces.",
  },
  {
    title: "Workshops",
    text: "Strong enough for daily use while still delivering a polished, premium surface clients notice immediately.",
  },
  {
    title: "Custom Finishes",
    text: "Distinct color and movement options that give each project a more custom, elevated visual identity.",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell min-h-screen text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 md:py-5">
          <div className="min-w-0 flex-1">
            <BrandMark href="/" subtitle="Premium Epoxy Systems" size="md" />
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a href="#systems" className="ui-btn">
              Systems
            </a>
            <a href="#projects" className="ui-btn">
              Projects
            </a>
            <Link href="/configurator" className="ui-btn">
              Configurator
            </Link>
            <Link href="/login" className="ui-btn ui-btn-primary">
              Login
            </Link>
          </div>

          <div className="md:hidden">
            <Link href="/login" className="ui-btn ui-btn-primary">
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="section-kicker">ArtiPoxi Surfaces</div>

            <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-[-0.04em] md:text-6xl xl:text-7xl">
              Premium floors.
              <br />
              Contractor strong.
              <br />
              Built to last.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 md:text-lg">
              ArtiPoxi creates premium epoxy systems for garages, shops, and
              custom spaces with a clean luxury finish and real-world durability.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#projects" className="ui-btn ui-btn-primary">
                View Projects
              </a>
              <a href="#contact" className="ui-btn">
                Start Your Quote
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label} className="glass-panel-soft rounded-[22px] p-4">
                  <div className="text-2xl font-black text-slate-100">{item.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-garage min-h-[340px] md:min-h-[580px]">
            <div className="flex h-full flex-col justify-between p-5 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="glass-panel-soft rounded-[22px] px-4 py-3">
                  <BrandMark href="/" subtitle="Featured Finish" size="sm" />
                </div>

                <div className="ui-chip ui-chip-silver hidden sm:inline-flex">
                  Garage transformation
                </div>
              </div>

              <div className="self-start rounded-[24px] border border-white/10 bg-black/45 p-4 backdrop-blur md:max-w-[380px] md:p-5">
                <div className="text-sm text-zinc-400">Featured system</div>
                <div className="mt-2 text-2xl font-black text-white md:text-3xl">
                  Black Resin Garage Finish
                </div>
                <div className="mt-2 text-sm leading-6 text-zinc-300">
                  Deep resin movement, strong contrast, and a premium modern finish
                  that feels custom without losing durability.
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MiniCard title="Space" value="Garage" />
                <MiniCard title="Style" value="Premium Epoxy" />
                <MiniCard title="Tone" value="Black / Silver" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="systems" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="max-w-2xl">
            <div className="section-kicker">Systems</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              Built for real spaces.
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-400">
              Professional systems for garages, work areas, and custom interior surfaces.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {systems.map((system) => (
              <div key={system.title} className="preview-frame">
                <div className="preview-image h-52" />
                <div className="p-5">
                  <div className="ui-chip mb-4">{system.title}</div>
                  <div className="text-2xl font-bold text-white">{system.title}</div>
                  <p className="mt-3 text-sm leading-7 text-zinc-400 md:text-base">
                    {system.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="max-w-2xl">
            <div className="section-kicker">Project Work</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              Clean before-and-after impact.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="preview-frame p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Before</div>
              <div className="preview-image mt-3 h-56 rounded-[20px]" />
            </div>

            <div className="preview-frame p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">After</div>
              <div className="hero-garage mt-3 h-56 rounded-[20px]" />
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
          <div className="glass-panel-strong rounded-[30px] p-6 text-center md:p-10">
            <div className="section-kicker">Request a Quote</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              Ready to transform your floor?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Reach out for pricing, finish recommendations, or secure project access.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="mailto:cameron@camspainting.co" className="ui-btn ui-btn-primary">
                Request a Quote
              </a>
              <Link href="/login" className="ui-btn">
                Secure Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
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
    <div className="rounded-[16px] border border-white/10 bg-black/35 p-3 backdrop-blur">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}