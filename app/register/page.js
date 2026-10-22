"use client";

import AuthForm from "@/components/AuthForm";
import { GuestRoute } from "@/components/ProtectedRoute";

export default function RegisterPage() {
  return (
    <GuestRoute>
      <AuthForm mode="register" />
    </GuestRoute>
  );
}
