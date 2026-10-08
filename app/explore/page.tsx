"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, ECS, FORMATS, HOURS, MAJORS, STRENGTHS, TYPES, type Commitment } from "@/lib/data";
import { hasPreferences, useAccount } from "@/lib/auth";
import { subjectScores } from "@/lib/grades";
import { EMPTY, LAST_SEARCH_KEY, fromQuery, isPersonalized, search, toQuery, type Filters, type Sort } from "@/lib/recommend";
import OppTile, { TileSkeleton } from "@/app/components/OppTile";

const PAGE = 24;
const toggleIn = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);
const TIME: [Commitment | "any", string][] = [["any", "Any time"], ["low", HOURS.low], ["medium", HOURS.medium], ["high", HOURS.high]];

export default function Explore() {
  const [ready, setReady] = useState(false);
  const [f, setF] = useState<Filters>(EMPTY);
  const [shown, setShown] = useState(PAGE);
  const [panel, setPanel] = useState(false);
  const { user, data } = useAccount();
  const scores = useMemo(() => (user ? subjectScores(data.courses) : {}), [user, data.courses]);
  const hasGrades = Object.keys(scores).length > 0;
  const p = data.profile;

  useEffect(() => {
    setF(fromQuery(window.location.search));
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const q = toQuery(f);
    window.history.replaceState(null, "", q ? `?${q}` : window.location.pathname);
    try { sessionStorage.setItem(LAST_SEARCH_KEY, q); } catch {}
    setShown(PAGE);
  }, [f, ready]);

  const set = (patch: Partial<Filters>) => setF((cur) => ({ ...cur, ...patch }));
  const results = useMemo(() => search(f, scores), [f, scores]);
  const extra = f.majors.length + f.strengths.length + f.categories.length + f.formats.length + (f.time !== "any" ? 1 : 0) + (f.strongOnly ? 1 : 0);
  const usingProfile = user && hasPreferences(p) && f.majors.join() === p.majors.join() && f.strengths.join() === p.strengths.join();

  return (
    <main className="wrap-inner explore">
      <div className="explore-bar">
        <input type="search" placeholder={`Search ${ECS.length.toLocaleString()} opportunities`} value={f.q}
          onChange={(e) => set({ q: e.target.value })} aria-label="Search opportunities" />
        <select value={hasGrades || f.sort !== "grades" ? f.sort : "match"} onChange={(e) => set({ sort: e.target.value as Sort })} aria-label="Sort">
          <option value="match">Best match</option>
          {hasGrades && <option value="grades">My best grades</option>}
          <option value="time">Least time</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className="chip-row type-chips">
        <button type="button" className="chip" aria-pressed={f.types.length === 0} onClick={() => set({ types: [] })}>All</button>
        {TYPES.map((t) => (
          <button key={t} type="button" className="chip" aria-pressed={f.types.includes(t)} onClick={() => set({ types: toggleIn(f.types, t) })}>{t}</button>
        ))}
      </div>

      <div className="explore-tools">
        {user && hasPreferences(p) && (
          <button type="button" className="chip" aria-pressed={!!usingProfile}
            onClick={() => usingProfile
              ? set({ majors: [], strengths: [], time: "any" })
              : set({ majors: p.majors, strengths: p.strengths, time: p.time, sort: hasGrades ? "grades" : f.sort })}>
            Match to my profile
          </button>
        )}
        <button type="button" className="chip" aria-expanded={panel} onClick={() => setPanel(!panel)}>
          More filters{extra > 0 && ` · ${extra}`}
        </button>
        {(extra > 0 || f.types.length > 0 || f.q) && (
          <button type="button" className="link small" onClick={() => setF({ ...EMPTY, sort: f.sort })}>Clear all</button>
        )}
        <span className="mono muted explore-count">{ready ? `${results.length.toLocaleString()} results` : "Loading"}</span>
      </div>

      {panel && (
        <div className="filter-panel">
          <ChipGroup label="Majors" all={MAJORS} picked={f.majors} onToggle={(m) => set({ majors: toggleIn(f.majors, m) })} />
          <ChipGroup label="Strengths" all={STRENGTHS} picked={f.strengths} onToggle={(s) => set({ strengths: toggleIn(f.strengths, s) })} />
          <ChipGroup label="Field" all={CATEGORIES} picked={f.categories} onToggle={(c) => set({ categories: toggleIn(f.categories, c) })} />
          <div className="chip-group">
            <span className="chip-label">Time</span>
            <div className="chip-row">
              {TIME.map(([v, l]) => <button key={v} type="button" className="chip" aria-pressed={f.time === v} onClick={() => set({ time: v })}>{l}</button>)}
            </div>
          </div>
          <ChipGroup label="Format" all={FORMATS} picked={f.formats} onToggle={(x) => set({ formats: toggleIn(f.formats, x) })} />
          {hasGrades && (
            <div className="chip-group">
              <span className="chip-label">Grades</span>
              <div className="chip-row">
                <button type="button" className="chip" aria-pressed={f.strongOnly} onClick={() => set({ strongOnly: !f.strongOnly })}>Only my A- or better subjects</button>
              </div>
            </div>
          )}
        </div>
      )}

      {!ready ? (
        <div className="tile-grid-results">{[0, 1, 2, 3, 4, 5].map((i) => <TileSkeleton key={i} />)}</div>
      ) : results.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Nothing matches all of that.</p>
          <p>Try fewer filters or a shorter search.</p>
        </div>
      ) : (
        <>
          {isPersonalized(f) && <p className="hint">Letter grades show how well each one matches what you picked.</p>}
          <div className="tile-grid-results">
            {results.slice(0, shown).map((r) => <OppTile key={r.ec.slug} r={r} />)}
          </div>
          {shown < results.length && (
            <div className="more">
              <span className="mono muted">Showing {shown} of {results.length.toLocaleString()}</span>
              <button type="button" className="btn-ghost" onClick={() => setShown(shown + PAGE)}>Show more</button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function ChipGroup<T extends string>({ label, all, picked, onToggle }: { label: string; all: readonly T[]; picked: T[]; onToggle: (x: T) => void }) {
  return (
    <div className="chip-group">
      <span className="chip-label">{label}</span>
      <div className="chip-row">
        {all.map((x) => <button key={x} type="button" className="chip" aria-pressed={picked.includes(x)} onClick={() => onToggle(x)}>{x}</button>)}
      </div>
    </div>
  );
}
