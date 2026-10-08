import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap prose">
      <p className="muted">404</p>
      <h1>This page doesn't exist.</h1>
      <p>The link may be old or mistyped. The activity finder is on the home page.</p>
      <p><Link href="/">Go to the finder</Link></p>
    </main>
  );
}
