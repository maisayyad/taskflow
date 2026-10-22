"use client";

import AuthForm from "@/components/AuthForm";
import { GuestRoute } from "@/components/ProtectedRoute";

export default function LoginPage() {
  return (
    <GuestRoute>
      <AuthForm mode="login" />
    </GuestRoute>
  );
}
