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
    <div className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <BrandMark href="/" subtitle="Secure client and team access" size="md" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
