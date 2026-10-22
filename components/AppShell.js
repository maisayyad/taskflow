"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;
  return (
    <div className="offline-banner" role="alert">
      You are offline. Changes cannot be saved until your connection returns.
    </div>
  );
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Failed to log out", err);
    }
  }

  return (
    <div className="app-shell">
      <OfflineBanner />
      <header
        className="navbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border-color, #e2e8f0)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Brand mark */}
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <Logo size="small" />
          </Link>

          <nav style={{ display: "flex", gap: "16px", fontWeight: "500" }}>
            <Link
              href="/dashboard"
              style={{ color: "#0d9488", textDecoration: "none" }}
            >
              Dashboard
            </Link>
            <Link href="/projects/new" style={{ textDecoration: "none" }}>
              New Project
            </Link>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>
            {user?.displayName || user?.email}
          </span>

          <ThemeToggle />

          <button
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              border: "1px solid var(--border-color, #cbd5e1)",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </div>
      </header>

      <main style={{ padding: "24px" }}>{children}</main>
    </div>
  );
}
