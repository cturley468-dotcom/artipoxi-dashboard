"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/auth/callback");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              ArtiPoxi
            </p>
            <h1 className="mt-3 text-3xl font-bold">Login</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Authorized users only. Contact ArtiPoxi if you need access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>

          {message && (
            <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-zinc-300">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}