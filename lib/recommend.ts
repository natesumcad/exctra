import {
  CATEGORIES, ECS, MAJORS, STRENGTHS,
  type Category, type Commitment, type EC, type Major, type Strength,
} from "./data";

export const LAST_SEARCH_KEY = "exctra:last-search";

export type Sort = "match" | "name" | "time";

export interface Filters {
  majors: Major[];
  strengths: Strength[];
  time: Commitment | "any";
  categories: Category[];
  q: string;
  sort: Sort;
}

export const EMPTY: Filters = { majors: [], strengths: [], time: "any", categories: [], q: "", sort: "match" };

export interface Result {
  ec: EC;
  score: number;
  grade: string | null;
  matchedMajors: Major[];
  matched: Strength[];
  overTime: number;
}

export const LEVEL: Record<Commitment, number> = { low: 0, medium: 1, high: 2 };
const GRADES: [number, string][] = [
  [0.9, "A+"], [0.75, "A"], [0.62, "A-"], [0.5, "B+"], [0.4, "B"], [0.3, "B-"], [0.2, "C+"], [0, "C"],
];

export function score(ec: EC, f: Filters) {
  const matchedMajors = ec.majors.filter((m) => f.majors.includes(m));
  const matched = ec.strengths.filter((s) => f.strengths.includes(s));
  const overTime = f.time === "any" ? 0 : Math.max(0, LEVEL[ec.commitment] - LEVEL[f.time]);
  // One major match is worth 5; extra matching majors add 1 each.
  const majorPts = matchedMajors.length ? 5 + (matchedMajors.length - 1) : 0;
  return { matchedMajors, matched, overTime, score: majorPts + matched.length * 2 - overTime * 2 };
}

export function search(f: Filters): Result[] {
  const personalized = f.majors.length > 0 || f.strengths.length > 0;
  const best = personalized ? Math.max(...ECS.map((ec) => score(ec, { ...f, time: "any" }).score), 1) : 1;
  const q = f.q.trim().toLowerCase();

  const rows = ECS.filter((ec) => !f.categories.length || f.categories.includes(ec.category))
    .filter((ec) => !q || `${ec.name} ${ec.description} ${ec.category}`.toLowerCase().includes(q))
    .map((ec) => {
      const s = score(ec, f);
      const ratio = s.score / best;
      const grade = personalized ? GRADES.find(([min]) => ratio >= min)![1] : null;
      return { ec, ...s, grade };
    })
    .filter((r) => !personalized || r.score > 0);

  const byName = (a: Result, b: Result) => a.ec.name.localeCompare(b.ec.name);
  if (f.sort === "name") return rows.sort(byName);
  if (f.sort === "time")
    return rows.sort((a, b) => LEVEL[a.ec.commitment] - LEVEL[b.ec.commitment] || b.score - a.score || byName(a, b));
  return rows.sort((a, b) => b.score - a.score || byName(a, b));
}

/* Filters <-> URL query, so a search can be shared as a link. */
const idx = <T,>(all: readonly T[], picked: T[]) => picked.map((x) => all.indexOf(x)).join(".");
const unidx = <T,>(all: readonly T[], raw: string | null) =>
  (raw ?? "").split(".").filter(Boolean).map((i) => all[Number(i)]).filter((x): x is T => x !== undefined);

export function toQuery(f: Filters): string {
  const p = new URLSearchParams();
  if (f.majors.length) p.set("m", idx(MAJORS, f.majors));
  if (f.strengths.length) p.set("s", idx(STRENGTHS, f.strengths));
  if (f.categories.length) p.set("c", idx(CATEGORIES, f.categories));
  if (f.time !== "any") p.set("time", f.time);
  if (f.q) p.set("q", f.q);
  if (f.sort !== "match") p.set("sort", f.sort);
  return p.toString();
}

export function fromQuery(search: string): Filters {
  const p = new URLSearchParams(search);
  const time = p.get("time");
  const sort = p.get("sort");
  return {
    majors: unidx(MAJORS, p.get("m")),
    strengths: unidx(STRENGTHS, p.get("s")),
    categories: unidx(CATEGORIES, p.get("c")),
    time: time && time in LEVEL ? (time as Commitment) : "any",
    q: p.get("q") ?? "",
    sort: sort === "name" || sort === "time" ? sort : "match",
  };
}
