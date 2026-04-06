"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "../../lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const profile = await getCurrentProfile();

        if (!profile) {
          router.replace("/login");
          return;
        }

        if (profile.role === "admin" || profile.role === "staff") {
          router.replace("/dashboard");
          return;
        }

        router.replace("/portal");
      } catch {
        router.replace("/login");
      }
    }

    load();
  }, [router]);

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="rounded-xl border border-white/10 bg-neutral-900 p-4">
        Redirecting...
      </div>
    </div>
  );
}
