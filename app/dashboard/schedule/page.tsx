"use client";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SchedulePage() {
  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        <section className="hero-garage p-5 md:p-7">
          <div className="section-kicker">Schedule</div>
          <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
            Project
            <br />
            Calendar.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
            Weekly scheduling with a cleaner layout built for fast overview and mobile visibility.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {days.map((day) => (
            <div key={day} className="glass-panel-strong rounded-[24px] p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{day}</div>
              <div className="mt-3 text-xl font-bold text-white">
                {day.slice(0, 3)}
              </div>
              <div className="mt-4 rounded-[18px] border border-white/10 bg-black/25 p-4 text-sm text-zinc-400">
                No jobs scheduled
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
