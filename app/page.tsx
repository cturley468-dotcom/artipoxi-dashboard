import Link from "next/link";
import BrandMark from "./components/BrandMark";

const systems = [
  {
    title: "Garage / Shop",
    text: "High-performance decorative epoxy systems built for durability, easy maintenance, and a premium finish.",
  },
  {
    title: "Patio / Outdoor",
    text: "Slip-resistant exterior coatings designed to handle weather, traffic, and everyday outdoor use.",
  },
  {
    title: "Commercial",
    text: "Professional-grade surface systems for businesses, workspaces, and clean modern environments.",
  },
];

const highlights = [
  { value: "500+", label: "Projects" },
  { value: "5★", label: "Rated" },
  { value: "10+ YRS", label: "Experience" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 md:py-5">
          <BrandMark href="/" subtitle="Premium Epoxy Systems" size="md" />

          <div className="hidden items-center gap-3 md:flex">
            <a href="#projects" className="ui-btn">
              Projects
            </a>
            <a href="#systems" className="ui-btn">
              Systems
            </a>
            <a href="#configurator" className="ui-btn">
              Configurator
            </a>
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

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <div className="section-kicker">Premium Epoxy Floors</div>

          <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
            Floors that
            <br />
            perform.
            <br />
            Styles that
            <br />
            impress.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg md:leading-8">
            Durable. Beautiful. Built for your space. ArtiPoxi creates premium
            epoxy systems for garages, patios, shops, and commercial surfaces
            with a focus on finish quality and long-term performance.
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
                <div className="text-2xl font-black text-cyan-300">{item.value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-frame overflow-hidden">
          <div className="relative min-h-[320px] bg-[radial-gradient(circle_at_20%_30%,rgba(73,230,255,0.14),transparent_18%),linear-gradient(135deg,#070b12_0%,#0a1119_45%,#05070b_100%)] md:min-h-[560px]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />

            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent" />

            <div className="absolute left-0 top-0 h-full w-full p-5 md:p-8">
              <div className="flex h-full flex-col justify-between">
                <div className="flex justify-end">
                  <div className="ui-chip ui-chip-cyan">Premium showroom look</div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 backdrop-blur md:max-w-[320px]">
                  <div className="text-sm text-zinc-400">Featured system</div>
                  <div className="mt-2 text-2xl font-black text-white md:text-3xl">
                    Midnight Garage Finish
                  </div>
                  <div className="mt-2 text-sm leading-6 text-zinc-300">
                    Deep charcoal flake system with a crisp, modern finish and
                    premium reflective depth.
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniCard title="Space" value="Garage / Shop" />
                  <MiniCard title="Style" value="Decorative Flake" />
                  <MiniCard title="Finish" value="High Gloss" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="systems" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="max-w-2xl">
            <div className="section-kicker">Our Featured Systems</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              Transform your concrete to match your vision.
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-400">
              Professionally installed, custom epoxy floors built to last.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {systems.map((system) => (
              <div key={system.title} className="glass-panel-soft rounded-[28px] overflow-hidden">
                <div className="h-52 bg-[radial-gradient(circle_at_top_left,rgba(73,230,255,0.12),transparent_25%),linear-gradient(135deg,#11161d_0%,#0a0f15_50%,#06080d_100%)]" />
                <div className="p-5">
                  <div className="ui-chip ui-chip-cyan mb-4">{system.title}</div>
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
            <div className="section-kicker">Design Your Floor</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              Preview your space. Request a quote.
            </h2>
          </div>

          <div className="mt-8 rounded-[30px] border border-white/10 bg-black/20 p-3 md:p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,#11151c_0%,#0b0f15_100%)] p-4 md:p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  Before
                </div>
                <div className="mt-3 h-44 rounded-[18px] border border-white/10 bg-black/20 md:h-64" />
              </div>

              <div className="flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-2xl text-cyan-300 shadow-[0_0_20px_rgba(73,230,255,0.18)]">
                  ›
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(73,230,255,0.12),transparent_18%),linear-gradient(135deg,#11161d_0%,#080c12_100%)] p-4 md:p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  After
                </div>
                <div className="mt-3 h-44 rounded-[18px] border border-cyan-400/10 bg-black/20 md:h-64" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="configurator" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="glass-panel-soft rounded-[30px] p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="section-kicker">Configurator</div>
                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                  Launch the configurator.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
                  Preview your floor direction, compare system styles, and move
                  toward a cleaner quote request process.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/configurator" className="ui-btn ui-btn-primary">
                    Launch Configurator
                  </Link>
                  <Link href="/login" className="ui-btn">
                    Employee Login
                  </Link>
                </div>
              </div>

              <div className="preview-frame p-4 md:p-5">
                <div className="preview-image rounded-[24px] p-4 md:p-5">
                  <div className="flex min-h-[260px] flex-col justify-between rounded-[20px] border border-cyan-400/10 bg-black/20 p-4 md:min-h-[320px]">
                    <div className="flex flex-wrap gap-2">
                      <span className="ui-chip">Garage / Shop</span>
                      <span className="ui-chip ui-chip-cyan">Decorative Flake</span>
                    </div>

                    <div className="self-start rounded-[18px] border border-white/10 bg-black/30 px-4 py-4">
                      <div className="text-sm text-zinc-400">Live preview</div>
                      <div className="mt-2 text-2xl font-black text-cyan-300 md:text-3xl">
                        Midnight Blend
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <MiniCard title="Color" value="Midnight" />
                      <MiniCard title="Finish" value="High Gloss" />
                      <MiniCard title="Feel" value="Premium" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-zinc-500">
            Integrated with your workflow and built to grow with the business.
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
          <div className="glass-panel-soft rounded-[30px] p-6 text-center md:p-10">
            <div className="section-kicker">Request a Quote</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              Ready to build your next floor?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Reach out for project pricing, finish recommendations, or secure
              portal access for an existing job.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:cameron@camspainting.co"
                className="ui-btn ui-btn-primary"
              >
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
    <div className="rounded-[16px] border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
