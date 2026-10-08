"use client";

import Link from "next/link";
import { Fragment } from "react";
import { HOURS, findBySlug } from "@/lib/data";
import { hasPreferences, useAccount } from "@/lib/auth";
import { AWARD_LEVELS } from "@/lib/chances";
import { pointsToLetter, subjectScores, unweightedGpa } from "@/lib/grades";
import { EMPTY, search, toQuery } from "@/lib/recommend";
import OppTile from "@/app/components/OppTile";

export default function Overview() {
  const { data } = useAccount();
  const { profile: p, courses, scores } = data;
  const subj = subjectScores(courses);
  const filters = { ...EMPTY, majors: p.majors, strengths: p.strengths, time: p.time };
  const done = new Set(p.activities);
  const matches = hasPreferences(p) ? search(filters, subj).filter((r) => !done.has(r.ec.slug)).slice(0, 6) : [];
  const gpa = scores.gpa || (unweightedGpa(courses)?.toFixed(2) ?? "");
  const activities = p.activities.map(findBySlug).filter((e) => e !== undefined);

  return (
    <main className="wrap-inner account-body">
      {!p.setupDone && (
        <div className="setup-banner">
          <div>
            <strong>Finish setting up your profile</strong>
            <p className="muted">A few quick questions so we can match opportunities and estimate college chances.</p>
          </div>
          <Link href="/setup" className="btn">Continue setup</Link>
        </div>
      )}

      {matches.length > 0 && (
        <section className="panel-section">
          <div className="section-head">
            <div className="section-label">Top matches for you</div>
            <Link href={`/explore?${toQuery(filters)}`}>See all</Link>
          </div>
          <div className="tile-grid-results compact">
            {matches.map((r) => <OppTile key={r.ec.slug} r={r} />)}
          </div>
        </section>
      )}

      <div className="summary-grid">
        <Summary title="About you" step={0} rows={[
          ["Name", p.name || "Not set"],
          ["Grade", p.grade ? `${p.grade}th` : "Not set"],
          ["Time", p.time === "any" ? "Any amount" : HOURS[p.time]],
        ]} />
        <Summary title="Majors and strengths" step={1} rows={[
          ["Majors", p.majors.join(", ") || "Not set"],
          ["Strengths", p.strengths.join(", ") || "Not set"],
        ]} />
        <Summary title="Scores" step={5} rows={[
          ["GPA", gpa || "Not set"],
          ["SAT", scores.sat || "Not set"],
          ["ACT", scores.act || "Not set"],
        ]} />
        <section className="panel-section">
          <div className="section-head">
            <div className="section-label">Classes</div>
            <Link href="/setup?step=4">Edit</Link>
          </div>
          {courses.length === 0 ? (
            <p className="empty-line">No classes yet.</p>
          ) : (
            <ul className="mini-list">
              {courses.map((c) => (
                <li key={c.id}>
                  <span>{c.course}{c.level !== "Regular" && <span className="muted"> · {c.level}</span>}</span>
                  <span className="mono">{c.grade ?? "-"}{c.apScore ? ` / ${c.apScore}` : ""}</span>
                </li>
              ))}
            </ul>
          )}
          {Object.keys(subj).length > 0 && (
            <p className="hint">
              Strongest: {Object.entries(subj).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s, v]) => `${s} ${pointsToLetter(v)}`).join(", ")}
            </p>
          )}
        </section>
        <section className="panel-section span-2">
          <div className="section-head">
            <div className="section-label">Activities you&apos;ve done</div>
            <Link href="/setup?step=6">Edit</Link>
          </div>
          {activities.length === 0 ? (
            <p className="empty-line">None added yet.</p>
          ) : (
            <div className="chip-row">
              {activities.map((ec) => <Link key={ec.slug} href={`/activities/${ec.slug}`} className="chip on">{ec.name}</Link>)}
            </div>
          )}
          <p className="hint">Highest award: {AWARD_LEVELS[p.award].label}</p>
        </section>
      </div>
    </main>
  );
}

function Summary({ title, step, rows }: { title: string; step: number; rows: [string, string][] }) {
  return (
    <section className="panel-section">
      <div className="section-head">
        <div className="section-label">{title}</div>
        <Link href={`/setup?step=${step}`}>Edit</Link>
      </div>
      <dl className="kv">
        {rows.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}
      </dl>
    </section>
  );
}
