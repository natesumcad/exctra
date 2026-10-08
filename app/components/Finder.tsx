"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CATEGORIES, ECS, HOURS, MAJORS, STRENGTHS, slugify,
  type Category, type Commitment, type Major, type Strength,
} from "@/lib/data";
import { useAccount } from "@/lib/auth";
import SaveButton from "./SaveButton";
import { EMPTY, LAST_SEARCH_KEY, fromQuery, search, toQuery, type Filters, type Result, type Sort } from "@/lib/recommend";


const TIME: { value: Commitment | "any"; label: string; hint?: string }[] = [
  { value: "any", label: "Any amount" },
  { value: "low", label: "Light", hint: "1 to 3 hrs/wk" },
  { value: "medium", label: "Steady", hint: "4 to 8 hrs/wk" },
  { value: "high", label: "All in", hint: "9+ hrs/wk" },
];

const toggleIn = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

function listPhrase(items: string[]) {
  if (items.length <= 2) return items.join(" and ");
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export default function Finder() {
  const [ready, setReady] = useState(false);
  const [f, setF] = useState<Filters>(EMPTY);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
  }, [f, ready]);

  const set = (patch: Partial<Filters>) => setF((cur) => ({ ...cur, ...patch }));
  const { user, data } = useAccount();
  const profile = data.profile;
  const hasProfile = profile.majors.length > 0 || profile.strengths.length > 0;
  const results = useMemo(() => search(f), [f]);
  const activeCount = f.majors.length + f.strengths.length + f.categories.length + (f.time !== "any" ? 1 : 0);

  const title = f.majors.length
    ? `Best Extracurriculars for ${listPhrase(f.majors.filter((m) => m !== "Undecided"))}${f.majors.some((m) => m !== "Undecided") ? " Majors" : "Undecided Students"}`
    : f.strengths.length
      ? "Best Extracurriculars for Your Strengths"
      : `Explore ${ECS.length} Extracurriculars`;

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
          onClick={() => setF({ ...EMPTY, q: f.q, sort: f.sort, majors: profile.majors, strengths: profile.strengths, time: profile.time })}>
          Use my profile
        </button>
      )}
      <CheckGroup title="Intended majors" note="Select all that apply" all={MAJORS} picked={f.majors}
        onToggle={(m) => set({ majors: toggleIn(f.majors, m) })} onClear={() => set({ majors: [] })} initial={6} />
      <CheckGroup title="Strengths" note="Select all that apply" all={STRENGTHS} picked={f.strengths}
        onToggle={(s) => set({ strengths: toggleIn(f.strengths, s) })} onClear={() => set({ strengths: [] })} initial={6} />
      <section className="fgroup">
        <h3 className="fgroup-title">Time per week</h3>
        {TIME.map((t) => (
          <label key={t.value} className="check">
            <input type="radio" name="time" checked={f.time === t.value} onChange={() => set({ time: t.value })} />
            <span>{t.label}{t.hint && <span className="muted"> · {t.hint}</span>}</span>
          </label>
        ))}
      </section>
      <CheckGroup title="Activity type" all={CATEGORIES} picked={f.categories}
        onToggle={(c) => set({ categories: toggleIn(f.categories, c) })} onClear={() => set({ categories: [] })}
        counts={Object.fromEntries(CATEGORIES.map((c) => [c, ECS.filter((ec) => ec.category === c).length]))} initial={9} />
      {activeCount > 0 && (
        <button type="button" className="link" onClick={() => setF({ ...EMPTY, q: f.q, sort: f.sort })}>Clear all filters</button>
      )}
    </>
  );

  return (
    <main>
      <div className="page-head">
        <div className="wrap-inner">
          <p className="crumb"><Link href="/">Exctra</Link> / Extracurricular search</p>
          <h1>{ready ? title : `Explore ${ECS.length} Extracurriculars`}</h1>
          <p className="lede">Check your intended majors and strengths. Each activity gets a match grade, and you can open any one for the details and a first step.</p>
        </div>
      </div>

      <div className="wrap-inner search-layout">
        <aside className="sidebar" aria-label="Filters">{sidebar}</aside>

        <section className="results" aria-live="polite">
          <div className="toolbar">
            <input type="search" placeholder="Search activities" value={f.q} aria-label="Search activities"
              onChange={(e) => set({ q: e.target.value })} />
            <button type="button" className="filters-btn" onClick={() => setSheetOpen(true)}>
              Filters{activeCount > 0 && ` (${activeCount})`}
            </button>
          </div>
          <div className="results-meta">
            <span>{ready ? `${results.length} ${results.length === 1 ? "result" : "results"}` : "Loading"}</span>
            <span className="meta-right">
              {activeCount > 0 && <button type="button" className="link" onClick={share}>{copied ? "Link copied" : "Copy link"}</button>}
              <label>
                Sort by{" "}
                <select value={f.sort} onChange={(e) => set({ sort: e.target.value as Sort })}>
                  <option value="match">Best match</option>
                  <option value="time">Least time</option>
                  <option value="name">Name</option>
                </select>
              </label>
            </span>
          </div>

          {!ready ? <Skeleton /> : results.length === 0 ? (
            <div className="empty">
              <p className="empty-title">No activities match all of that.</p>
              <p>Try removing an activity type, clearing the search box, or checking another strength.</p>
            </div>
          ) : (
            <ol className="cards">
              {results.map((r, i) => <ResultCard key={r.ec.name} r={r} rank={i + 1} showRank={f.sort === "match" && r.grade !== null} />)}
            </ol>
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
            <button type="button" className="btn" onClick={() => setSheetOpen(false)}>Show {results.length} results</button>
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
        {showRank && <span className="card-rank">#{rank} Best match</span>}
        <h2 className="card-title"><Link href={`/activities/${slugify(ec.name)}`}>{ec.name}</Link></h2>
        <p className="card-sub">{ec.category} · {HOURS[ec.commitment]}</p>
        <p className="card-desc">{ec.description}</p>
        {(r.matchedMajors.length > 0 || r.matched.length > 0 || r.overTime > 0) && (
          <dl className="card-facts">
            {r.matchedMajors.length > 0 && (<div><dt>Fits majors</dt><dd>{r.matchedMajors.join(", ")}</dd></div>)}
            {r.matched.length > 0 && (<div><dt>Uses strengths</dt><dd>{r.matched.join(", ")}</dd></div>)}
            {r.overTime > 0 && (<div><dt>Heads up</dt><dd className="warn">Takes more time than you picked</dd></div>)}
          </dl>
        )}
      </div>
      <div className="card-side">
      {r.grade && (
        <div className="grade" data-tier={r.grade[0]} aria-label={`Match grade ${r.grade}`}>
          <span className="grade-letter">{r.grade}</span>
          <span className="grade-label">Match</span>
        </div>
      )}
        <SaveButton slug={slugify(ec.name)} name={ec.name} />
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
          {counts && <span className="count">{counts[x]}</span>}
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
          <div className="sk" style={{ width: "40%", height: 18 }} />
          <div className="sk" style={{ width: "25%" }} />
          <div className="sk" style={{ width: "85%" }} />
        </div>
      ))}
    </div>
  );
}
