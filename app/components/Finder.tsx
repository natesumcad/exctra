"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, ECS, FORMATS, HOURS, MAJORS, STRENGTHS, TYPES, type Commitment } from "@/lib/data";
import { useAccount } from "@/lib/auth";
import { pointsToLetter, subjectScores } from "@/lib/grades";
import { EMPTY, LAST_SEARCH_KEY, fromQuery, isPersonalized, search, toQuery, type Filters, type Result, type Sort } from "@/lib/recommend";
import SaveButton from "./SaveButton";

const PAGE = 24;
const TIME: { value: Commitment | "any"; label: string; hint?: string }[] = [
  { value: "any", label: "Any amount" },
  { value: "low", label: "Light", hint: "1-3 h" },
  { value: "medium", label: "Steady", hint: "4-8 h" },
  { value: "high", label: "All in", hint: "9+ h" },
];

const toggleIn = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);
const count = <K extends string>(key: (e: (typeof ECS)[number]) => K) =>
  ECS.reduce<Record<string, number>>((m, e) => ((m[key(e)] = (m[key(e)] ?? 0) + 1), m), {});
const TYPE_COUNTS = count((e) => e.type);
const CATEGORY_COUNTS = count((e) => e.category);

function listPhrase(items: string[]) {
  if (items.length <= 2) return items.join(" and ");
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export default function Finder() {
  const [ready, setReady] = useState(false);
  const [f, setF] = useState<Filters>(EMPTY);
  const [shown, setShown] = useState(PAGE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, data } = useAccount();
  const scores = useMemo(() => (user ? subjectScores(data.courses) : {}), [user, data.courses]);
  const hasGrades = Object.keys(scores).length > 0;
  const profile = data.profile;
  const hasProfile = profile.majors.length > 0 || profile.strengths.length > 0;

  useEffect(() => {
    setF(fromQuery(window.location.search));
    setReady(true);
  }, []);

  // Keep the URL in sync so the search can be shared or bookmarked.
  useEffect(() => {
    if (!ready) return;
    const q = toQuery(f);
    window.history.replaceState(null, "", q ? `?${q}` : window.location.pathname);
    try { sessionStorage.setItem(LAST_SEARCH_KEY, q); } catch {}
    setCopied(false);
    setShown(PAGE);
  }, [f, ready]);

  const set = (patch: Partial<Filters>) => setF((cur) => ({ ...cur, ...patch }));
  const results = useMemo(() => search(f, scores), [f, scores]);
  const activeCount = f.majors.length + f.strengths.length + f.categories.length + f.types.length + f.formats.length
    + (f.time !== "any" ? 1 : 0) + (f.strongOnly ? 1 : 0);

  const realMajors = f.majors.filter((m) => m !== "Undecided");
  const title = realMajors.length
    ? `Opportunities for ${listPhrase(realMajors)} majors`
    : f.majors.length
      ? "Opportunities for undecided students"
      : isPersonalized(f)
        ? "Opportunities that fit your strengths"
        : `${ECS.length.toLocaleString()} opportunities`;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      window.prompt("Copy this link:", window.location.href);
    }
  };

  const sidebar = (
    <>
      {user && hasProfile && (
        <button type="button" className="use-profile"
          onClick={() => setF({ ...EMPTY, q: f.q, sort: hasGrades ? "grades" : f.sort, majors: profile.majors, strengths: profile.strengths, time: profile.time })}>
          Use my profile{hasGrades && " and grades"}
        </button>
      )}
      <CheckGroup title="Intended majors" note="Select all that apply" all={MAJORS} picked={f.majors}
        onToggle={(m) => set({ majors: toggleIn(f.majors, m) })} onClear={() => set({ majors: [] })} initial={7} />
      <CheckGroup title="Strengths" note="Select all that apply" all={STRENGTHS} picked={f.strengths}
        onToggle={(s) => set({ strengths: toggleIn(f.strengths, s) })} onClear={() => set({ strengths: [] })} initial={6} />
      {user && (
        <section className="fgroup">
          <h3 className="fgroup-title">Grades</h3>
          {hasGrades ? (
            <label className="check">
              <input type="checkbox" checked={f.strongOnly} onChange={() => set({ strongOnly: !f.strongOnly })} />
              <span>Only subjects where I have an A- or better</span>
            </label>
          ) : (
            <p className="fgroup-note"><Link href="/account/strengths">Log course grades</Link> to filter and sort by them.</p>
          )}
        </section>
      )}
      <CheckGroup title="Opportunity type" all={TYPES} picked={f.types} counts={TYPE_COUNTS}
        onToggle={(t) => set({ types: toggleIn(f.types, t) })} onClear={() => set({ types: [] })} initial={9} />
      <CheckGroup title="Field" all={CATEGORIES} picked={f.categories} counts={CATEGORY_COUNTS}
        onToggle={(c) => set({ categories: toggleIn(f.categories, c) })} onClear={() => set({ categories: [] })} initial={10} />
      <section className="fgroup">
        <h3 className="fgroup-title">Time per week</h3>
        {TIME.map((t) => (
          <label key={t.value} className="check">
            <input type="radio" name="time" checked={f.time === t.value} onChange={() => set({ time: t.value })} />
            <span>{t.label}{t.hint && <span className="muted mono"> {t.hint}</span>}</span>
          </label>
        ))}
      </section>
      <CheckGroup title="Format" all={FORMATS} picked={f.formats}
        onToggle={(x) => set({ formats: toggleIn(f.formats, x) })} onClear={() => set({ formats: [] })} initial={2} />
      {activeCount > 0 && (
        <button type="button" className="link" onClick={() => setF({ ...EMPTY, q: f.q, sort: f.sort })}>Clear all filters</button>
      )}
    </>
  );

  return (
    <main>
      <div className="page-head">
        <div className="wrap-inner">
          <p className="eyebrow">Opportunity search</p>
          <h1>{ready ? title : `${ECS.length.toLocaleString()} opportunities`}</h1>
          <p className="lede">Competitions, summer programs, research, jobs, clubs, and projects. Check your majors and strengths to rank them.</p>
        </div>
      </div>

      <div className="wrap-inner search-layout">
        <aside className="sidebar" aria-label="Filters">{sidebar}</aside>

        <section className="results" aria-live="polite">
          <div className="toolbar">
            <input type="search" placeholder="Search by name, field, or keyword" value={f.q} aria-label="Search opportunities"
              onChange={(e) => set({ q: e.target.value })} />
            <button type="button" className="filters-btn" onClick={() => setSheetOpen(true)}>
              Filters{activeCount > 0 && ` (${activeCount})`}
            </button>
          </div>
          <div className="results-meta">
            <span className="mono">{ready ? `${results.length.toLocaleString()} ${results.length === 1 ? "result" : "results"}` : "Loading"}</span>
            <span className="meta-right">
              {activeCount > 0 && <button type="button" className="link" onClick={share}>{copied ? "Link copied" : "Copy link"}</button>}
              <label>
                <span className="sr-only">Sort by</span>
                <select value={hasGrades || f.sort !== "grades" ? f.sort : "match"} onChange={(e) => set({ sort: e.target.value as Sort })}>
                  <option value="match">Sort: Best match</option>
                  {hasGrades && <option value="grades">Sort: My best grades</option>}
                  <option value="time">Sort: Least time</option>
                  <option value="name">Sort: Name</option>
                </select>
              </label>
            </span>
          </div>

          {!ready ? <Skeleton /> : results.length === 0 ? (
            <div className="empty">
              <p className="empty-title">Nothing matches all of that.</p>
              <p>Try removing a type or field, clearing the search box, or checking another strength.</p>
            </div>
          ) : (
            <>
              <ol className="cards">
                {results.slice(0, shown).map((r, i) => (
                  <ResultCard key={r.ec.slug} r={r} rank={i + 1} showRank={f.sort === "match" && r.grade !== null} />
                ))}
              </ol>
              {shown < results.length && (
                <div className="more">
                  <span className="mono muted">Showing {shown} of {results.length.toLocaleString()}</span>
                  <button type="button" className="btn-ghost" onClick={() => setShown(shown + PAGE)}>Show {Math.min(PAGE, results.length - shown)} more</button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {sheetOpen && (
        <div className="sheet" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="sheet-head">
            <strong>Filters</strong>
            <button type="button" className="link" onClick={() => setSheetOpen(false)}>Close</button>
          </div>
          <div className="sheet-body">{sidebar}</div>
          <div className="sheet-foot">
            <button type="button" className="btn" onClick={() => setSheetOpen(false)}>Show {results.length.toLocaleString()} results</button>
          </div>
        </div>
      )}
    </main>
  );
}

function ResultCard({ r, rank, showRank }: { r: Result; rank: number; showRank: boolean }) {
  const { ec } = r;
  return (
    <li className="card">
      <div className="card-main">
        <p className="card-meta">
          {showRank && <span className="card-rank">#{rank}</span>}
          <span>{ec.type}</span>
          <span>{ec.category}</span>
          {ec.curated && <span className="tag-named">Named program</span>}
        </p>
        <h2 className="card-title"><Link href={`/activities/${ec.slug}`}>{ec.name}</Link></h2>
        <p className="card-desc">{ec.description}</p>
        <dl className="card-facts">
          <div><dt>Time</dt><dd>{HOURS[ec.commitment]}</dd></div>
          <div><dt>Format</dt><dd>{ec.format}</dd></div>
          {r.matchedMajors.length > 0 && <div><dt>Fits majors</dt><dd>{r.matchedMajors.join(", ")}</dd></div>}
          {r.matched.length > 0 && <div><dt>Uses strengths</dt><dd>{r.matched.join(", ")}</dd></div>}
          {r.fit !== null && <div><dt>Your grades</dt><dd>{r.fitSubjects.join(", ")} <span className="mono">{pointsToLetter(r.fit)}</span></dd></div>}
          {r.overTime > 0 && <div><dt>Heads up</dt><dd className="warn">More time than you picked</dd></div>}
        </dl>
      </div>
      <div className="card-side">
        {r.grade && (
          <div className="grade" data-tier={r.grade[0]} aria-label={`Match grade ${r.grade}`}>
            <span className="grade-letter">{r.grade}</span>
            <span className="grade-label">match</span>
          </div>
        )}
        <SaveButton slug={ec.slug} name={ec.name} />
      </div>
    </li>
  );
}

function CheckGroup<T extends string>({ title, note, all, picked, onToggle, onClear, counts, initial }: {
  title: string; note?: string; all: readonly T[]; picked: T[];
  onToggle: (x: T) => void; onClear: () => void; counts?: Record<string, number>; initial: number;
}) {
  const [expanded, setExpanded] = useState(false);
  // Always show checked items, even if they sit past the fold.
  const visible = expanded ? all : all.filter((x, i) => i < initial || picked.includes(x));
  return (
    <section className="fgroup">
      <div className="fgroup-head">
        <h3 className="fgroup-title">{title}</h3>
        {picked.length > 0 && <button type="button" className="link small" onClick={onClear}>Clear</button>}
      </div>
      {note && <p className="fgroup-note">{note}</p>}
      {visible.map((x) => (
        <label key={x} className="check">
          <input type="checkbox" checked={picked.includes(x)} onChange={() => onToggle(x)} />
          <span>{x}</span>
          {counts && <span className="count mono">{counts[x] ?? 0}</span>}
        </label>
      ))}
      {all.length > initial && (
        <button type="button" className="link small" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show fewer" : `Show all ${all.length}`}
        </button>
      )}
    </section>
  );
}

function Skeleton() {
  return (
    <div aria-hidden="true" className="cards">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="card sk-card">
          <div className="sk" style={{ width: "25%" }} />
          <div className="sk" style={{ width: "50%", height: 18 }} />
          <div className="sk" style={{ width: "85%" }} />
        </div>
      ))}
    </div>
  );
}
