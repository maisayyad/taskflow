export default function ConfigWarning() {
  return (
    <div className="center-screen">
      <div className="card auth-card" role="alert">
        <h1>Firebase is not configured</h1>
        <p>
          Copy <code>.env.example</code> to <code>.env.local</code>, fill in your Firebase web-app values, and
          restart the dev server. On Vercel, add the same <code>NEXT_PUBLIC_FIREBASE_*</code> variables in the
          project settings and redeploy.
        </p>
      </div>
    </div>
  );
}
