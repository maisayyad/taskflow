"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth";
import { createProject } from "@/services/projects";

const css = `
  .np {
    --np-card: #ffffff;
    --np-input: #ffffff;
    --np-text: #1e293b;
    --np-label: #334155;
    --np-muted: #64748b;
    --np-hint: #64748b;
    --np-border: #cbd5e1;
    --np-card-border: #e2e8f0;
    --np-link: #0f766e;
    --np-cancel-bg: #f1f5f9;
    --np-cancel-text: #475569;
    --np-err-bg: #fef2f2;
    --np-err-text: #dc2626;
    color-scheme: light;
  }
  :root[data-theme="dark"] .np {
    --np-card: #181c27;
    --np-input: #0f121a;
    --np-text: #e9ecf4;
    --np-label: #d5d9e6;
    --np-muted: #a6aec4;
    --np-hint: #98a1b8;
    --np-border: #3a435a;
    --np-card-border: #2a3144;
    --np-link: #2dd4bf;
    --np-cancel-bg: #262d3f;
    --np-cancel-text: #e0e4ef;
    --np-err-bg: #3a1c1a;
    --np-err-text: #ff9f95;
    color-scheme: dark;
  }
  .np { max-width: 700px; margin: 0 auto; padding: 20px; }
  .np-back { color: var(--np-link); text-decoration: none; font-size: 14px; font-weight: 600; }
  .np-back:hover { text-decoration: underline; }
  .np-title { font-size: 28px; font-weight: 800; color: var(--np-text); margin: 16px 0 24px; }
  .np-card {
    background: var(--np-card);
    border: 1px solid var(--np-card-border);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.12);
  }
  .np-error {
    padding: 12px; margin-bottom: 16px; border-radius: 8px;
    background: var(--np-err-bg); color: var(--np-err-text);
    font-size: 14px; font-weight: 600;
  }
  .np-field { margin-bottom: 20px; }
  .np-label { display: block; font-size: 14px; font-weight: 600; color: var(--np-label); margin-bottom: 6px; }
  .np-label span { color: var(--np-muted); font-weight: 400; }
  .np-input {
    width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 14px;
    border-radius: 8px; border: 1px solid var(--np-border);
    background: var(--np-input); color: var(--np-text);
    outline: none; font-family: inherit;
  }
  .np-input::placeholder { color: var(--np-hint); }
  .np-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.3); }
  textarea.np-input { resize: vertical; }
  .np-hint { display: block; font-size: 12px; color: var(--np-hint); margin-top: 4px; }
  .np-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px; }
  .np-submit {
    padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer;
    background: #0d9488; color: #ffffff; font-weight: 600; font-size: 14px;
  }
  .np-submit:hover:not(:disabled) { background: #0f766e; }
  .np-submit:disabled { opacity: 0.7; cursor: not-allowed; }
  .np-cancel {
    padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer;
    background: var(--np-cancel-bg); color: var(--np-cancel-text);
    font-size: 14px; font-weight: 600; display: inline-block; font-family: inherit;
  }
  .np-cancel:hover { filter: brightness(1.08); }
  .np a:focus-visible, .np button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
`;

export default function NewProjectModalPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") router.back();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      await createProject(user, {
        name: projectName,
        description: description,
      });

      router.back();
      router.refresh();
    } catch (err) {
      console.error("Failed to create project:", err);
      setErrorMessage("Failed to create project: " + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="np-overlay" onClick={() => router.back()}>
      <div
        className="np-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="np">
          <style>{css}</style>

          <Link href="/dashboard" className="np-back">
            Back to Dashboard
          </Link>

          <h1 id="new-project-title" className="np-title">
            Create Project
          </h1>

          <div className="np-card">
            {errorMessage && (
              <div className="np-error" role="alert">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="np-field">
                <label className="np-label" htmlFor="project-name">
                  Project Name <span>(required)</span>
                </label>
                <input
                  id="project-name"
                  className="np-input"
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  aria-describedby="project-name-hint"
                />
                <span id="project-name-hint" className="np-hint">
                  Choose a clear name for your project.
                </span>
              </div>

              <div className="np-field">
                <label className="np-label" htmlFor="project-description">
                  Description <span>(optional)</span>
                </label>
                <textarea
                  id="project-description"
                  className="np-input"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  aria-describedby="project-description-hint"
                />
                <span id="project-description-hint" className="np-hint">
                  Add a brief description of the project.
                </span>
              </div>

              <div className="np-actions">
                <button
                  type="submit"
                  className="np-submit"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Project"}
                </button>
                <button
                  type="button"
                  className="np-cancel"
                  onClick={() => router.back()}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
