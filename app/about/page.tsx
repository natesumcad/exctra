import type { Metadata } from "next";
import Link from "next/link";
import { ECS } from "@/lib/data";

export const metadata: Metadata = { title: "How grades work" };

export default function About() {
  return (
    <main className="wrap prose">
      <h1>How match grades work</h1>
      <p>
        Exctra keeps a hand-written list of {ECS.length} extracurriculars. Each one is tagged with the
        majors it supports, the strengths it uses, and roughly how many hours a week it takes.
        As you check boxes, every activity gets a score:
      </p>
      <table className="score-table">
        <tbody>
          <tr><td>Fits at least one of your majors</td><td>+5</td></tr>
          <tr><td>Each additional major it fits</td><td>+1</td></tr>
          <tr><td>Each strength it uses that you checked</td><td>+2</td></tr>
          <tr><td>Each time level above what you picked</td><td>−2</td></tr>
        </tbody>
      </table>
      <p>
        Activities that score zero or below are hidden. The match grade compares each score with
        the best score any activity could get from your picks, so an A+ means it's about as good a
        fit as the list has for you:
      </p>
      <table className="score-table">
        <tbody>
          <tr><td>A+</td><td>90% or more of the top score</td></tr>
          <tr><td>A / A-</td><td>62% to 89%</td></tr>
          <tr><td>B+ / B / B-</td><td>30% to 61%</td></tr>
          <tr><td>C+ / C</td><td>Below 30%</td></tr>
        </tbody>
      </table>
      <h2>What it doesn't know</h2>
      <p>
        It doesn't know what your school offers, what you already do, or what you actually enjoy.
        Colleges care most about depth and impact in a few activities, so treat the list as ideas
        to try, then keep the ones you'd do even if nobody was grading them.
      </p>
      <h2>We're early</h2>
      <p>
        This is a new student project with test accounts only and no paid tier. If an activity is missing
        or a tag looks wrong, that's useful feedback.
      </p>
      <p><Link href="/">Back to the finder</Link></p>
    </main>
  );
}
