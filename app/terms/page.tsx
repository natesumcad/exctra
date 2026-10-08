import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return (
    <main className="wrap prose">
      <h1>Terms of use</h1>
      <p className="muted">Last updated October 8, 2026</p>
      <p>By using Exctra you agree to these terms.</p>
      <h2>Informational only</h2>
      <p>
        Recommendations are general suggestions generated from a fixed list and simple scoring
        rules. They are not admissions, academic, or career advice, and they don't guarantee any
        outcome. Check details like eligibility, dates, and costs with the organization that runs
        each activity.
      </p>
      <h2>Third parties</h2>
      <p>
        Exctra mentions competitions and organizations it is not affiliated with. Their names
        belong to their owners.
      </p>
      <h2>No warranty</h2>
      <p>
        The site is provided as is, without warranties of any kind. We aren't liable for decisions
        made based on its suggestions.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms. Continued use after an update means you accept the new version.</p>
    </main>
  );
}
