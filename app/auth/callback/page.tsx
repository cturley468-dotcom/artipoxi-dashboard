"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "../../lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      const profile = await getCurrentProfile();

      if (!mounted) return;

      if (!profile) {
        router.replace("/login");
        return;
      }

      const role = String(profile.role || "").toLowerCase();

      if (role === "installer") {
        router.replace("/installer");
        return;
      }

      if (role === "customer") {
        router.replace("/portal");
        return;
      }

      setCheckingAccess(false);
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checkingAccess) {
    return <div className="text-white p-6">Checking access...</div>;
  }

  return (
    <div>
      {/* existing dashboard content */}
    </div>
  );
}
