import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { friendlyAuthError } from "@/lib/errors";
import {
  hasErrors,
  validateLogin,
  validateRegistration,
} from "@/lib/validation";
import { TextField } from "./FormFields";
import { Notice } from "./StateViews";
import Logo from "./Logo";
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirebase } from "@/lib/firebase";

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const router = useRouter();

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State for showing / hiding the password
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (field) => (event) => {
    const value =
      field === "rememberMe" ? event.target.checked : event.target.value;
    setValues((v) => ({ ...v, [field]: value }));
  };

  async function onSubmit(event) {
    event.preventDefault();
    setFormError("");
    const found = isRegister
      ? validateRegistration(values)
      : validateLogin(values);
    setErrors(found);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      if (isRegister) {
        await register(values);
      } else {
        // Get Firebase auth and apply the "Remember me" persistence
        const { auth } = getFirebase();
        const persistence = values.rememberMe
          ? browserLocalPersistence
          : browserSessionPersistence;

        await setPersistence(auth, persistence);

        // Complete the sign-in
        await login(values);
      }
      router.replace("/dashboard");
    } catch (error) {
      console.error(error);
      setFormError(friendlyAuthError(error));
      setSubmitting(false);
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
        className="auth-light"
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
        {/* The card is always light, so its inputs stay white even in dark mode */}
        <style>{`
          .auth-light input:not([type="checkbox"]) {
            background-color: #ffffff;
            color: #1e293b;
            color-scheme: light;
          }
          .auth-light input::placeholder { color: #94a3b8; }
          .auth-light input[type="checkbox"] {
            color-scheme: light;
            background-color: initial;
            min-height: 0;
            padding: 0;
            border: revert;
            accent-color: #0d9488;
          }
        `}</style>

        {/* Logo */}
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
            👋 Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            {isRegister
              ? "Start managing your projects efficiently"
              : "Sign in to continue managing your projects"}
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          {formError ? <Notice>{formError}</Notice> : null}

          {isRegister ? (
            <TextField
              id="name"
              label="Full name"
              required
              autoComplete="name"
              value={values.name}
              onChange={onChange("name")}
              error={errors.name}
            />
          ) : null}

          {/* Email field */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={values.email}
              onChange={onChange("email")}
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
            {errors.email && (
              <span style={{ fontSize: "12px", color: "#ef4444" }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password row with "Forgot password?" link */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <label
              htmlFor="password"
              style={{ fontSize: "14px", fontWeight: "500", color: "#334155" }}
            >
              Password
            </label>
            {!isRegister && (
              <Link
                href="/forgot-password"
                style={{
                  fontSize: "13px",
                  color: "#0d9488",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </Link>
            )}
          </div>

          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={values.password}
              onChange={onChange("password")}
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "10px 40px 10px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0",
                display: "flex",
                alignItems: "center",
                color: "#64748b",
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
            {errors.password && (
              <span style={{ fontSize: "12px", color: "#ef4444" }}>
                {errors.password}
              </span>
            )}
          </div>

          {!isRegister && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <input
                type="checkbox"
                id="rememberMe"
                checked={values.rememberMe}
                onChange={onChange("rememberMe")}
                style={{
                  width: "16px",
                  height: "16px",
                  margin: 0,
                  accentColor: "#0d9488",
                  cursor: "pointer",
                }}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  fontSize: "14px",
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Remember me
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "#0d9488",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              boxShadow: "0 4px 6px -1px rgba(13, 148, 136, 0.3)",
              transition: "all 0.2s ease",
            }}
          >
            {submitting
              ? isRegister
                ? "Creating account..."
                : "Signing in..."
              : isRegister
                ? "Register"
                : "Sign in"}
          </button>
        </form>

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
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                style={{
                  color: "#0d9488",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link
                href="/register"
                style={{
                  color: "#0d9488",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Create one
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
