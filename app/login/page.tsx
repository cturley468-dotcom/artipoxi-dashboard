"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMessage("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.replace("/");
      }
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold">
          {isSignup ? "Create Account" : "Login"}
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg bg-black border border-white/10 p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg bg-black border border-white/10 p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500 text-black font-semibold py-3"
        >
          {loading ? "Loading..." : isSignup ? "Sign Up" : "Login"}
        </button>

        {message && (
          <div className="text-sm text-red-400">{message}</div>
        )}

        <button
          type="button"
          onClick={() => setIsSignup(!isSignup)}
          className="text-sm text-cyan-300"
        >
          {isSignup
            ? "Already have an account? Login"
            : "Create an account"}
        </button>
      </form>
    </div>
  );
}
