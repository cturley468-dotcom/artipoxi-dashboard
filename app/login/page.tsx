"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="page-shell">
      <div className="app-container flex min-h-screen items-center justify-center">
        <div className="app-card w-full max-w-[620px] app-section">
          <div className="app-kicker">ArtiPoxi</div>
          <h1 className="app-title mt-4">Login</h1>
          <p className="app-subtitle mt-4">
            Authorized users only. Contact ArtiPoxi if you need access.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              type="email"
              className="ui-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              className="ui-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="ui-btn ui-btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {message ? (
            <div className="mt-4 text-sm text-red-400">{message}</div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
