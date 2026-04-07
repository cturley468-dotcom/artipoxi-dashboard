import Link from "next/link";

const services = [
  {
    title: "Epoxy Flooring",
    text: "Durable, high-end floor systems for garages, shops, patios, and commercial spaces.",
  },
  {
    title: "Project Management",
    text: "Track scheduling, installers, materials, and progress from one clean system.",
  },
  {
    title: "Customer Updates",
    text: "Give clients a simple place to view status, dates, notes, and project progress.",
  },
];

const highlights = [
  "Premium floor systems",
  "Fast scheduling workflow",
  "Installer assignment tools",
  "Customer portal access",
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
              Premium epoxy flooring & project operations
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#services"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/30 sm:inline-flex"
            >
              Services
            </a>

            <a
              href="#contact"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/30 sm:inline-flex"
            >
              Contact
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

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
            ArtiPoxi Operations
          </p>

          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Design your floor.
            <br />
            Run your projects.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            ArtiPoxi combines premium epoxy flooring with a modern project
            workflow for customers, office staff, and installers.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Request a Quote
            </a>

            <Link
              href="/login"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:border-cyan-400/30"
            >
              Client / Team Login
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
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
                  Floor Builder Preview
                </div>
                <div className="mt-2 text-2xl font-bold text-white">
                  Premium Garage System
                </div>
              </div>

              <div className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-300">
                Live Preview
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <PreviewCard title="Space" value="2-Car Garage" />
              <PreviewCard title="Square Footage" value="400 SF" />
              <PreviewCard title="Color Blend" value="Midnight Flake" />
              <PreviewCard title="Finish" value="High Gloss" />
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
              <div className="text-sm text-zinc-400">Estimated Range</div>
              <div className="mt-2 text-3xl font-black text-cyan-300">
                $3,200 – $4,100
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <MiniStep step="1" text="Choose system" />
              <MiniStep step="2" text="Review quote" />
              <MiniStep step="3" text="Assign crew" />
              <MiniStep step="4" text="Track progress" />
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="border-t border-white/10 bg-neutral-950/60"
      >
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Services
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Built for real projects.
            </h2>
            <p className="mt-4 text-zinc-400">
              From first quote to final walkthrough, ArtiPoxi is built to keep
              jobs clean, organized, and professional.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-2xl font-bold">{service.title}</h3>
                <p className="mt-4 leading-7 text-zinc-400">{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            <FeatureCard
              title="For Customers"
              text="Clients can log in and view project status, dates, notes, and updates in one place."
            />
            <FeatureCard
              title="For Office Staff"
              text="Manage scheduling, jobs, installers, materials, and work orders from the dashboard."
            />
            <FeatureCard
              title="For Installers"
              text="Assigned crews see only their own work orders and schedule, without exposing financials."
            />
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-white/10 bg-neutral-950">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Contact
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Start your next project.
            </h2>

            <p className="mt-4 max-w-2xl text-zinc-400">
              Need a quote, project update, or secure login access? Reach out
              and we’ll get you pointed in the right direction.
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

function FeatureCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-4 leading-7 text-zinc-400">{text}</p>
    </div>
  );
}