"use client";

import Link from "next/link";
import { useState } from "react";
import BrandMark from "../components/BrandMark";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/portal`,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password reset email sent.");
  }

  return (
    <main className="page-shell min-h-screen text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-8 md:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hero-garage min-h-[340px] p-5 md:min-h-[640px] md:p-8">
          <div className="flex h-full flex-col justify-between">
            <div>
              <BrandMark href="/" subtitle="Premium Epoxy Systems" size="md" />
            </div>

            <div className="max-w-xl rounded-[28px] border border-white/10 bg-black/45 p-5 backdrop-blur md:p-7">
              <div className="section-kicker">Secure Access</div>
              <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
                Welcome
                <br />
                back.
              </h1>
              <p className="mt-5 text-base leading-8 text-zinc-300">
                Employee, installer, and admin access for jobs, scheduling, work
                orders, and business operations.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/" className="ui-btn ui-btn-primary">
                  Back to Home
                </Link>
                <Link href="/configurator" className="ui-btn">
                  Open Configurator
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel-strong rounded-[30px] p-5 md:p-7">
          <div className="mb-6 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={`ui-btn ${mode === "login" ? "ui-btn-primary" : ""}`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setMessage("");
              }}
              className={`ui-btn ${mode === "reset" ? "ui-btn-primary" : ""}`}
            >
              Reset
            </button>
          </div>

          <div className="panel-title">
            {mode === "login" ? "Sign in" : "Reset password"}
          </div>

          <div className="panel-subtitle mt-2 text-sm">
            {mode === "login"
              ? "Use your company login to access the system."
              : "Enter your email to receive a reset link."}
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">Email</label>
                <input
                  type="email"
                  className="field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">Password</label>
                <input
                  type="password"
                  className="field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="ui-btn ui-btn-primary w-full">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">Email</label>
                <input
                  type="email"
                  className="field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="ui-btn ui-btn-primary w-full">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {message ? (
            <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
              {message}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
