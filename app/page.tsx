"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ECS, TYPES, type OppType } from "@/lib/data";
import { hasPreferences, useAccount } from "@/lib/auth";
import { subjectScores } from "@/lib/grades";
import { EMPTY, search, toQuery, type Filters } from "@/lib/recommend";
import OppTile, { TileSkeleton } from "./components/OppTile";

const SHELF_ORDER: [OppType, string][] = [
  ["Scholarship", "Scholarships"],
  ["Competition", "Competitions"],
  ["Summer program", "Summer programs"],
  ["Research", "Research"],
  ["Job / internship", "Jobs and internships"],
  ["Leadership role", "Leadership"],
  ["Volunteering", "Volunteering"],
  ["Club", "Clubs"],
  ["Independent project", "Projects you can start"],
  ["Online course", "Courses and certifications"],
];
const PER_SHELF = 14;

export default function Home() {
  const router = useRouter();
  const { ready, user, data } = useAccount();
  const [q, setQ] = useState("");

  // Old shared links put filters on the home page; send them to Explore.
  useEffect(() => {
    if (window.location.search) router.replace(`/explore${window.location.search}`);
  }, [router]);

  const personal = ready && !!user && hasPreferences(data.profile);
  const scores = useMemo(() => (user ? subjectScores(data.courses) : {}), [user, data.courses]);
  const base: Filters = personal
    ? { ...EMPTY, majors: data.profile.majors, strengths: data.profile.strengths, time: data.profile.time }
    : EMPTY;
  const done = new Set(data.profile.activities);
  const pick = (f: Filters, skip = new Set<string>()) =>
    search(f, scores).filter((r) => !done.has(r.ec.slug) && !skip.has(r.ec.slug)).slice(0, PER_SHELF);
  // Type shelves skip whatever is already in Top matches so rows don't repeat.
  const top = personal ? pick(base) : [];
  const inTop = new Set(top.map((r) => r.ec.slug));

  return (
    <main>
      <section className="hero">
        <div className="wrap-inner">
          <h1>{personal && data.profile.name ? `${data.profile.name}, here's what to do next.` : "Find what to do next."}</h1>
          <form className="hero-search" onSubmit={(e) => { e.preventDefault(); router.push(`/explore${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); }}>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${ECS.length.toLocaleString()} opportunities and scholarships`} aria-label="Search" />
            <button type="submit" className="btn">Search</button>
          </form>
          {ready && !user && (
            <p className="hero-note"><Link href="/login">Log in</Link> to rank everything by your major, strengths, and grades.</p>
          )}
          {ready && user && !data.profile.setupDone && (
            <p className="hero-note"><Link href="/setup">Finish setting up your profile</Link> to get matches made for you.</p>
          )}
        </div>
      </section>

      <div className="wrap-inner shelves">
        {(personal || !ready) && (
          <Shelf title="Top matches for you" href={`/explore?${toQuery(base)}`} loading={!ready} items={top} />
        )}
        {SHELF_ORDER.map(([type, title]) => (
          <Shelf key={type} title={title} href={`/explore?t=${TYPES.indexOf(type)}`} items={pick({ ...base, types: [type] }, inTop)} />
        ))}
      </div>
    </main>
  );
}

function Shelf({ title, href, items, loading }: { title: string; href: string; items: ReturnType<typeof search>; loading?: boolean }) {
  const row = useRef<HTMLDivElement>(null);
  const nudge = (dir: number) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.85, behavior: "smooth" });
  if (!loading && items.length === 0) return null;
  return (
    <section className="shelf">
      <div className="shelf-head">
        <h2>{title}</h2>
        <div className="shelf-actions">
          <button type="button" className="shelf-btn" aria-label={`Scroll ${title} left`} onClick={() => nudge(-1)}>‹</button>
          <button type="button" className="shelf-btn" aria-label={`Scroll ${title} right`} onClick={() => nudge(1)}>›</button>
          <Link href={href}>See all</Link>
        </div>
      </div>
      <div className="shelf-row" ref={row}>
        {loading ? [0, 1, 2, 3].map((i) => <TileSkeleton key={i} />) : items.map((r) => <OppTile key={r.ec.slug} r={r} />)}
      </div>
    </section>
  );
}
