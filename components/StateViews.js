import Link from "next/link";

/** Loading placeholder (NFR-01, FR-15). */
export function Loading({ label = "Loading..." }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

/** Skeleton cards shown while dashboard data loads. */
export function SkeletonGrid({ count = 3 }) {
  return (
    <div className="grid" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card skeleton" aria-hidden="true">
          <div className="skeleton-line wide" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="state empty">
      <h3>{title}</h3>
      {message ? <p>{message}</p> : null}
      {action ?? null}
    </div>
  );
}

/** Inline error / info message. role=alert so screen readers announce it. */
export function Notice({ kind = "error", children, onDismiss }) {
  return (
    <div className={`notice notice-${kind}`} role={kind === "error" ? "alert" : "status"}>
      <div>{children}</div>
      {onDismiss ? (
        <button type="button" className="btn btn-small" onClick={onDismiss}>
          Dismiss
        </button>
      ) : null}
    </div>
  );
}

export function AccessDenied({ message }) {
  return (
    <div className="state" role="alert">
      <h1>Access denied</h1>
      <p>{message ?? "You do not have permission to view this page."}</p>
      <Link className="btn btn-primary" href="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}

export function NotFound({ message }) {
  return (
    <div className="state" role="alert">
      <h1>Not found</h1>
      <p>{message ?? "This page or project does not exist (it may have been deleted)."}</p>
      <Link className="btn btn-primary" href="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}
