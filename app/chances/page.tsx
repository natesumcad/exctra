"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COLLEGES, STATES } from "@/lib/colleges";
import { GRADE_POINTS, MAJORS, findBySlug, type Major } from "@/lib/data";
import { STATUS_LABEL, useAccount, type Academics } from "@/lib/auth";
import {
  AP_EXAMS, AWARD_LEVELS, actToSat, activityPoints, effectLabel, estimate,
  type Applicant, type AwardLevel, type Band,
} from "@/lib/chances";

const BANDS: Band[] = ["Likely", "Target", "Reach", "Far reach"];
type SortKey = "chance" | "selective" | "name";

const num = (s: string, lo: number, hi: number) => {
  const n = Number(s);
  return s.trim() !== "" && Number.isFinite(n) && n >= lo && n <= hi ? n : null;
};
const pct = (p: number) => (p < 0.01 ? "<1%" : `${Math.round(p * 100)}%`);

export default function ChancesPage() {
  const { data, saveAcademics, setStatus } = useAccount();
  const ac = data.academics;
  const set = (patch: Partial<Academics>) => saveAcademics({ ...ac, ...patch });
  const [apExam, setApExam] = useState<string>(AP_EXAMS[0]);
  const [apScore, setApScore] = useState(5);
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [band, setBand] = useState<Band | "">("");
  const [sort, setSort] = useState<SortKey>("chance");

  const major = ac.major || data.profile.majors[0] || "";
  const courseGpa = data.courses.length
    ? data.courses.reduce((t, c) => t + Math.min(4, GRADE_POINTS[c.grade]), 0) / data.courses.length
    : null;
  const apCourses = data.courses.filter((c) => c.level === "AP / IB").length;
  const saved = data.saved.map((s) => ({ ...s, ec: findBySlug(s.slug) })).filter((s) => s.ec);
  const joined = saved.filter((s) => s.status === "joined").map((s) => s.ec!);

  const gpa = num(ac.gpa, 0, 4.0);
  const sat = num(ac.sat, 400, 1600);
  const act = num(ac.act, 1, 36);
  const satBadStep = sat !== null && sat % 10 !== 0;
  const best = Math.max(sat ?? 0, act !== null ? actToSat(act) : 0) || null;

  const applicant: Applicant = {
    major: major as Major | "",
    gpa,
    sat: best,
    apCount: Math.max(ac.aps.length, apCourses),
    apAvg: ac.aps.length ? ac.aps.reduce((t, x) => t + x.score, 0) / ac.aps.length : null,
    activities: joined,
    award: ac.award,
  };

  const key = JSON.stringify({ ...applicant, activities: applicant.activities.map((x) => x.slug) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <div className="section-label">Intended major</div>
            <select className="full" value={major} onChange={(e) => set({ major: e.target.value as Major })} aria-label="Intended major">
              <option value="">Not sure yet</option>
              {MAJORS.filter((m) => m !== "Undecided").map((m) => <option key={m}>{m}</option>)}
            </select>
            <p className="hint">Computer science, engineering, nursing, and business are harder to get into at some schools.</p>
          </section>

          <section className="panel-section">
            <div className="section-label">Grades</div>
            <label className="field">
              <span>Unweighted GPA <span className="muted">(4.0 scale)</span></span>
              <input inputMode="decimal" placeholder="e.g. 3.85" value={ac.gpa} onChange={(e) => set({ gpa: e.target.value })} />
            </label>
            {ac.gpa && gpa === null && <p className="error">Enter a GPA between 0 and 4.0.</p>}
            {courseGpa !== null && (
              <button type="button" className="link small" onClick={() => set({ gpa: courseGpa.toFixed(2) })}>
                Use my logged courses ({courseGpa.toFixed(2)})
              </button>
            )}
          </section>

          <section className="panel-section">
            <div className="section-label">Test scores <span className="muted">optional</span></div>
            <div className="two-col tight">
              <label className="field">
                <span>SAT</span>
                <input inputMode="numeric" placeholder="400-1600" value={ac.sat} onChange={(e) => set({ sat: e.target.value })} />
              </label>
              <label className="field">
                <span>ACT</span>
                <input inputMode="numeric" placeholder="1-36" value={ac.act} onChange={(e) => set({ act: e.target.value })} />
              </label>
            </div>
            {((ac.sat && sat === null) || satBadStep) && <p className="error">SAT scores run from 400 to 1600 in steps of 10.</p>}
            {ac.act && act === null && <p className="error">ACT scores run from 1 to 36.</p>}
            <p className="hint">We use whichever is stronger. Leave both blank to see test-optional estimates.</p>
          </section>

          <section className="panel-section">
            <div className="section-label">AP exams</div>
            <div className="ap-add">
              <select value={apExam} onChange={(e) => setApExam(e.target.value)} aria-label="AP exam">
                {AP_EXAMS.map((x) => <option key={x}>{x}</option>)}
              </select>
              <select value={apScore} onChange={(e) => setApScore(Number(e.target.value))} aria-label="Score">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <button type="button" className="btn-ghost"
                onClick={() => set({ aps: [...ac.aps, { id: `${Date.now()}`, exam: apExam, score: apScore }] })}>Add</button>
            </div>
            {ac.aps.length > 0 && (
              <ul className="mini-list">
                {ac.aps.map((x) => (
                  <li key={x.id}>
                    <span>{x.exam}</span>
                    <span className="row-gap">
                      <span className="mono">{x.score}</span>
                      <button type="button" className="link small" onClick={() => set({ aps: ac.aps.filter((y) => y.id !== x.id) })}>Remove</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="hint">
              {apCourses > 0 ? `${apCourses} AP/IB course${apCourses === 1 ? "" : "s"} from your Strengths tab also count toward rigor. ` : ""}
              Add exams you&apos;ve taken; courses without scores yet can go on the <Link href="/account/strengths">Strengths</Link> tab.
            </p>
          </section>

          <section className="panel-section">
            <div className="section-label">Activities you&apos;ve done</div>
            {saved.length === 0 ? (
              <p className="hint">Save opportunities from <Link href="/">search</Link>, then check the ones you&apos;ve actually done here.</p>
            ) : (
              <>
                <p className="hint">Check the ones you&apos;ve done. Only checked activities count.</p>
                {saved.map((s) => (
                  <label key={s.slug} className="check">
                    <input type="checkbox" checked={s.status === "joined"}
                      onChange={() => setStatus(s.slug, s.status === "joined" ? "considering" : "joined")} />
                    <span>{s.ec!.name}</span>
                    <span className="count mono">{s.status === "joined" ? STATUS_LABEL.joined : ""}</span>
                  </label>
                ))}
              </>
            )}
            <label className="field top-gap">
              <span>Highest award or recognition</span>
              <select value={ac.award} onChange={(e) => set({ award: e.target.value as AwardLevel })}>
                {Object.entries(AWARD_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </label>
            <p className="hint mono">Activity strength {activityPoints(joined, applicant.major, ac.award).toFixed(1)}</p>
          </section>
        </aside>

        <section className="chances-results" aria-live="polite">
          {gpa === null ? (
            <div className="empty">
              <p className="empty-title">Enter your GPA to see estimates.</p>
              <p>Test scores, AP exams, and activities are optional but make the estimate more specific.</p>
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
