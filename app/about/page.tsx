import type { Metadata } from "next";
import Link from "next/link";
import { ECS } from "@/lib/data";

export const metadata: Metadata = { title: "How scoring works" };

export default function About() {
  return (
    <main className="wrap prose">
      <h1>How scoring works</h1>
      <p>
        Exctra keeps a hand-written list of {ECS.length} extracurriculars. Each one is tagged with the
        majors it supports, the strengths it uses, and roughly how many hours a week it takes.
        When you submit, every activity gets a score:
      </p>
      <table className="score-table">
        <tbody>
          <tr><td>Fits your intended major</td><td>+5</td></tr>
          <tr><td>Each strength it uses that you picked</td><td>+2</td></tr>
          <tr><td>Each time level above your budget</td><td>−2</td></tr>
        </tbody>
      </table>
      <p>
        Anything scoring zero or below is hidden, and the top eight are shown. The bar under each
        result is its score out of the best possible 13.
      </p>
      <h2>What it doesn't know</h2>
      <p>
        It doesn't know what your school offers, what you already do, or what you actually enjoy.
        Colleges care most about depth and impact in a few activities, so treat the list as ideas
        to try, then keep the ones you'd do even if nobody was grading them.
      </p>
      <h2>We're early</h2>
      <p>
        This is a new student project with no accounts and no paid tier. If an activity is missing
        or a tag looks wrong, that's useful feedback.
      </p>
      <p><Link href="/">Back to the finder</Link></p>
    </main>
  );
}
