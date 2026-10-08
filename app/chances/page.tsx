"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COLLEGES, STATES } from "@/lib/colleges";
import { MAJORS, findBySlug, type Major } from "@/lib/data";
import { useAccount } from "@/lib/auth";
import { AWARD_LEVELS, actToSat, activityPoints, effectLabel, estimate, type Applicant, type Band } from "@/lib/chances";
import { unweightedGpa } from "@/lib/grades";

const BANDS: Band[] = ["Likely", "Target", "Reach", "Far reach"];
type SortKey = "chance" | "selective" | "name";

const num = (s: string, lo: number, hi: number) => {
  const n = Number(s);
  return s.trim() !== "" && Number.isFinite(n) && n >= lo && n <= hi ? n : null;
};
const pct = (p: number) => (p < 0.01 ? "<1%" : `${Math.round(p * 100)}%`);

export default function ChancesPage() {
  const { data, updateScores } = useAccount();
  const { profile: p, scores, courses } = data;
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [band, setBand] = useState<Band | "">("");
  const [sort, setSort] = useState<SortKey>("chance");
  const [otherMajor, setOtherMajor] = useState(false);

  const major: Major | "" = scores.major || p.majors.find((m) => m !== "Undecided") || "";
  const autoGpa = unweightedGpa(courses);
  const gpa = num(scores.gpa, 0, 4) ?? autoGpa;
  const sat = num(scores.sat, 400, 1600);
  const act = num(scores.act, 1, 36);
  const best = Math.max(sat ?? 0, act !== null ? actToSat(act) : 0) || null;
  const apCourses = courses.filter((c) => c.level === "AP / IB");
  const apScores = apCourses.map((c) => c.apScore).filter((x): x is number => x !== null);
  const joined = p.activities.map(findBySlug).filter((e) => e !== undefined);

  const applicant: Applicant = {
    major,
    gpa,
    sat: best,
    apCount: apCourses.length,
    apAvg: apScores.length ? apScores.reduce((t, x) => t + x, 0) / apScores.length : null,
    activities: joined,
    award: p.award,
  };
  const key = JSON.stringify({ ...applicant, activities: joined.map((x) => x.slug) });
  const quickMajors = [...new Set([...p.majors.filter((m) => m !== "Undecided"), ...(major ? [major] : [])])];

  const rows = useMemo(() => COLLEGES.map((c) => ({ c, e: estimate(c, applicant) })), [key]);

  const counts = Object.fromEntries(BANDS.map((b) => [b, rows.filter((r) => r.e?.band === b).length])) as Record<Band, number>;
  const words = q.trim().toLowerCase();
  const shown = rows
    .filter((r) => (!state || r.c.state === state) && (!band || r.e?.band === band) && (!words || r.c.name.toLowerCase().includes(words)))
    .sort((a, b) =>
      sort === "name" ? a.c.name.localeCompare(b.c.name)
        : sort === "selective" ? a.c.admitRate - b.c.admitRate
          : (b.e?.p ?? 0) - (a.e?.p ?? 0) || a.c.admitRate - b.c.admitRate);

  return (
    <main>
      <div className="page-head">
        <div className="wrap-inner">
          <p className="eyebrow">College chances</p>
          <h1>Estimate your odds at {COLLEGES.length - 1} colleges</h1>
          <p className="lede">
            Based on your GPA, AP exams, test scores, intended major, and the activities you&apos;ve done.
            Estimates use rounded public admissions data and simple rules. They can&apos;t see essays,
            recommendations, or your background, so treat them as a rough guide.
          </p>
        </div>
      </div>

      <div className="wrap-inner chances-layout">
        <aside className="chances-inputs">
          <section className="panel-section">
            <div className="section-label">Applying as</div>
            <div className="chip-row">
              {quickMajors.map((m) => (
                <button key={m} type="button" className="chip" aria-pressed={major === m} onClick={() => updateScores({ major: m })}>{m}</button>
              ))}
              <button type="button" className="chip" aria-pressed={otherMajor} onClick={() => setOtherMajor(!otherMajor)}>
                {quickMajors.length ? "Other major" : "Choose a major"}
              </button>
            </div>
            {otherMajor && (
              <div className="chip-row top-gap">
                {MAJORS.filter((m) => m !== "Undecided" && !quickMajors.includes(m)).map((m) => (
                  <button key={m} type="button" className="chip" onClick={() => { updateScores({ major: m }); setOtherMajor(false); }}>{m}</button>
                ))}
              </div>
            )}
            <p className="hint">Computer science, engineering, nursing, and business are harder to get into at some schools.</p>
          </section>

          <section className="panel-section">
            <div className="section-head">
              <div className="section-label">Your record</div>
              <Link href="/setup?step=4">Edit</Link>
            </div>
            <dl className="kv record">
              <dt>GPA</dt>
              <dd>{gpa !== null ? gpa.toFixed(2) : <Link href="/setup?step=4">Add classes or a GPA</Link>}{gpa !== null && !num(scores.gpa, 0, 4) && <span className="muted"> from classes</span>}</dd>
              <dt>Tests</dt>
              <dd>{[sat && `SAT ${sat}`, act && `ACT ${act}`].filter(Boolean).join(" · ") || <span className="muted">None (test-optional)</span>}</dd>
              <dt>AP / IB</dt>
              <dd>{apCourses.length} class{apCourses.length === 1 ? "" : "es"}{apScores.length > 0 && <span className="muted"> · {apScores.length} exam{apScores.length === 1 ? "" : "s"} avg {applicant.apAvg!.toFixed(1)}</span>}</dd>
              <dt>Activities</dt>
              <dd>{joined.length} done · strength {activityPoints(joined, major, p.award).toFixed(1)}</dd>
              <dt>Top award</dt>
              <dd>{AWARD_LEVELS[p.award].label}</dd>
            </dl>
            <div className="row-gap">
              <Link href="/setup?step=5" className="btn-ghost">Edit scores</Link>
              <Link href="/setup?step=6" className="btn-ghost">Edit activities</Link>
            </div>
          </section>
        </aside>

        <section className="chances-results" aria-live="polite">
          {gpa === null ? (
            <div className="empty">
              <p className="empty-title">Add your classes or GPA to see estimates.</p>
              <p>Test scores, AP exams, and activities are optional but make the estimate more specific.</p>
              <Link href="/setup?step=4" className="btn">Add classes</Link>
            </div>
          ) : (
            <>
              <div className="band-row">
                {BANDS.map((b) => (
                  <button key={b} type="button" className="band-cell" aria-pressed={band === b} data-band={b}
                    onClick={() => setBand(band === b ? "" : b)}>
                    <span className="band-count mono">{counts[b]}</span>
                    <span className="band-name">{b}</span>
                  </button>
                ))}
              </div>
              <div className="toolbar chances-toolbar">
                <input type="search" placeholder="Search colleges" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search colleges" />
                <select value={state} onChange={(e) => setState(e.target.value)} aria-label="State">
                  <option value="">All states</option>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort">
                  <option value="chance">Highest chance</option>
                  <option value="selective">Most selective</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <p className="results-meta mono">{shown.length} colleges{band && ` · ${band}`}</p>

              <ol className="college-list">
                {shown.map(({ c, e }) => e && (
                  <li key={c.slug} className="college">
                    <div className="college-main">
                      <h2 className="college-name">{c.name}</h2>
                      <p className="college-meta mono">
                        {c.state !== "US" && <span>{c.state}</span>}
                        <span>Admit rate {c.admitRate >= 0.99 ? "open" : `${Math.round(c.admitRate * 1000) / 10}%`}</span>
                        {c.sat && <span>SAT {c.sat[0]}-{c.sat[1]}</span>}
                        <span>{c.policy === "required" ? "Test required" : c.policy === "blind" ? "Test blind" : "Test optional"}</span>
                      </p>
                      {e.warnings.map((w) => <p key={w} className="warn small">{w}</p>)}
                      <details className="why">
                        <summary>Why this estimate</summary>
                        <ul>
                          {e.factors.map((f) => (
                            <li key={f.label}>
                              <span className="why-label">{f.label}</span>
                              <span className="why-note">{f.note}</span>
                              <span className={`why-effect ${f.effect >= 0.15 ? "up" : f.effect <= -0.15 ? "down" : ""}`}>{effectLabel(f.effect)}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                    <div className="college-chance" data-band={e.band}>
                      <span className="chance-pct mono">{pct(e.p)}</span>
                      <span className="chance-band">{e.band}</span>
                      <span className="chance-bar"><span style={{ width: `${Math.max(2, e.p * 100)}%` }} /></span>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="hint">
                Admit rates and score ranges are approximate and change every year. Check each college&apos;s
                Common Data Set or admissions site for current numbers.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
