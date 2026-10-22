"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/Logo";
import { getFirebase } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { auth } = getFirebase();
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert(
        "There was an error sending the email. Check that the address is correct.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #f3f4f6 100%)",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "40px",
          width: "100%",
          maxWidth: "440px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)",
          border: "1px solid #f1f5f9",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Logo />
          <h1
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#1e293b",
              margin: "0 0 6px 0",
            }}
          >
            🔑 Reset password
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {submitted ? (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              padding: "16px",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                color: "#166534",
                fontSize: "14px",
                margin: "0 0 8px 0",
                fontWeight: "600",
              }}
            >
              Check your inbox!
            </p>
            <p style={{ color: "#15803d", fontSize: "13px", margin: 0 }}>
              We have sent a password reset link to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#0d9488",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 6px -1px rgba(13, 148, 136, 0.3)",
                transition: "all 0.2s ease",
              }}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#64748b",
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          Remember your password?{" "}
          <Link
            href="/login"
            style={{
              color: "#0d9488",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Back to Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
