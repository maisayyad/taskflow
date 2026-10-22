import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="center-screen">
      <div className="card auth-card">
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link className="btn btn-primary" href="/dashboard">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
