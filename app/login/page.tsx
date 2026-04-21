"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { getCurrentProfile } from "../lib/auth";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function redirectByRole() {
    try {
      const profile = await getCurrentProfile();

      if (!profile) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      const role = String(profile.role ?? "").toLowerCase();

      if (role === "installer") {
        router.replace("/installer");
        router.refresh();
        return;
      }

      if (role === "customer") {
        router.replace("/portal");
        router.refresh();
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      router.replace("/dashboard");
      router.refresh();
    }
  }

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (data.session) {
        await redirectByRole();
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setStatusMessage("Signing in...");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setStatusMessage("");
        setLoading(false);
        return;
      }

      if (!data.session) {
        setErrorMessage("No session was returned.");
        setStatusMessage("");
        setLoading(false);
        return;
      }

      setStatusMessage("Success. Redirecting...");
      await redirectByRole();
    } catch {
      setErrorMessage("Unexpected login error.");
      setStatusMessage("");
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brandRow}>
          <img
            src="/branding/site-logo.png"
            alt="ArtiPoxi logo"
            className={styles.sidebarLogoImage}
          />
          <div>
            <p className={styles.brandTop}>ARTIPOXI</p>
            <h2 className={styles.brandBottom}>Access Portal</h2>
          </div>
        </div>

        <p className={styles.eyebrow}>SIGN IN</p>
        <h1 className={styles.title}>Login</h1>
        <p className={styles.subtitle}>Access your dashboard.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {statusMessage ? <p className={styles.status}>{statusMessage}</p> : null}
          {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className={styles.links}>
          <Link href="/" className={styles.linkBtn}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
