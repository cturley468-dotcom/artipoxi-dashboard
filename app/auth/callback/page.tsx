"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (data.session) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  return null;
}
