"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ConfigWarning from "@/components/ConfigWarning";
import { Loading } from "@/components/StateViews";
import { useAuth } from "@/hooks/auth";

/** "/" - landing / redirect: signed-in users go to the dashboard, everyone else to login. */
export default function HomePage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!configured || loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [configured, loading, user, router]);

  if (!configured) return <ConfigWarning />;
  return (
    <div className="center-screen">
      <Loading label="Loading TaskFlow..." />
    </div>
  );
}
