"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import AppShell from "./AppShell";
import ConfigWarning from "./ConfigWarning";
import { Loading } from "./StateViews";

/** FR-03: unauthenticated visitors are redirected to /login and never see protected content. */
export function ProtectedRoute({ children }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (configured && !loading && !user) router.replace("/login");
  }, [configured, loading, user, router]);

  if (!configured) return <ConfigWarning />;
  if (loading || !user) {
    return (
      <div className="center-screen">
        <Loading label="Checking your session..." />
      </div>
    );
  }
  return <AppShell>{children}</AppShell>;
}

/** Login / register pages: signed-in users are sent straight to the dashboard. */
export function GuestRoute({ children }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  if (!configured) return <ConfigWarning />;
  if (loading || user) {
    return (
      <div className="center-screen">
        <Loading />
      </div>
    );
  }
  return children;
}
