"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import BrandMark from "../components/BrandMark";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      router.push("/auth/callback");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 md:px-6">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="glass-panel-soft rounded-[30px] p-6 md:p-8">
            <BrandMark href="/" subtitle="Secure Access" size="md" />

            <div className="mt-8">
              <div className="section-kicker">Team / Client Access</div>
              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Sign in to your workspace.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
                Employees, installers, and approved clients can securely access
                their dashboard, portal, and assigned work.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <MiniInfo title="Employees" value="Operations" />
              <MiniInfo title="Installers" value="Assigned Work" />
              <MiniInfo title="Clients" value="Project Updates" />
            </div>
          </section>

          <section className="glass-panel-soft rounded-[30px] p-6 md:p-8">
            <div className="section-kicker">Login</div>
            <div className="mt-3 panel-title">Secure Login</div>
            <div className="panel-subtitle mt-2 text-sm">
              Use your approved email and password to continue.
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="ui-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className="ui-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="ui-btn ui-btn-primary w-full disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Login"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function MiniInfo({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
