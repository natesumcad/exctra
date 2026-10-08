import {
  CATEGORIES, ECS, FORMATS, MAJORS, STRENGTHS, TYPES,
  type Category, type Commitment, type EC, type Format, type Major, type OppType, type Strength, type Subject,
} from "./data";
import { STRONG_THRESHOLD, gradeFit, type SubjectScores } from "./grades";

export const LAST_SEARCH_KEY = "exctra:last-search";

export type Sort = "match" | "grades" | "name" | "time";

export interface Filters {
  majors: Major[];
  strengths: Strength[];
  time: Commitment | "any";
  categories: Category[];
  types: OppType[];
  formats: Format[];
  strongOnly: boolean;
  q: string;
  sort: Sort;
}

export const EMPTY: Filters = {
  majors: [], strengths: [], time: "any", categories: [], types: [], formats: [], strongOnly: false, q: "", sort: "match",
};

export interface Result {
  ec: EC;
  score: number;
  grade: string | null;
  matchedMajors: Major[];
  matched: Strength[];
  overTime: number;
  fit: number | null;
  fitSubjects: Subject[];
}

export const LEVEL: Record<Commitment, number> = { low: 0, medium: 1, high: 2 };
const GRADES: [number, string][] = [
  [0.9, "A+"], [0.75, "A"], [0.62, "A-"], [0.5, "B+"], [0.4, "B"], [0.3, "B-"], [0.2, "C+"], [0, "C"],
];

export function score(ec: EC, f: Filters, scores: SubjectScores = {}) {
  const matchedMajors = ec.majors.filter((m) => f.majors.includes(m));
  const matched = ec.strengths.filter((s) => f.strengths.includes(s));
  const overTime = f.time === "any" ? 0 : Math.max(0, LEVEL[ec.commitment] - LEVEL[f.time]);
  const gf = gradeFit(ec, scores);
  // One major match is worth 5; extra matching majors add 1 each.
  const majorPts = matchedMajors.length ? 5 + (matchedMajors.length - 1) : 0;
  // Strong grades in an activity's subjects add up to 3.
  const gradePts = gf ? Math.max(0, Math.min(3, Math.round((gf.fit - 2.7) * 2))) : 0;
  return {
    matchedMajors, matched, overTime,
    fit: gf?.fit ?? null, fitSubjects: gf?.subjects ?? [],
    score: majorPts + matched.length * 2 + gradePts - overTime * 2,
  };
}

export function isPersonalized(f: Filters) {
  return f.majors.length > 0 || f.strengths.length > 0;
}

export function search(f: Filters, scores: SubjectScores = {}): Result[] {
  const personalized = isPersonalized(f);
  const best = personalized ? Math.max(...ECS.map((ec) => score(ec, { ...f, time: "any" }, scores).score), 1) : 1;
  const words = f.q.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const rows: Result[] = [];
  for (const ec of ECS) {
    if (f.categories.length && !f.categories.includes(ec.category)) continue;
    if (f.types.length && !f.types.includes(ec.type)) continue;
    if (f.formats.length && !f.formats.some((x) => ec.format === x || ec.format === "Online or in person")) continue;
    if (words.length) {
      const hay = `${ec.name} ${ec.description} ${ec.category} ${ec.type}`.toLowerCase();
      if (!words.every((w) => hay.includes(w))) continue;
    }
    const s = score(ec, f, scores);
    if (f.strongOnly && (s.fit === null || s.fit < STRONG_THRESHOLD)) continue;
    if (personalized && s.score <= 0) continue;
    const grade = personalized ? GRADES.find(([min]) => s.score / best >= min)![1] : null;
    rows.push({ ec, ...s, grade });
  }

  const byName = (a: Result, b: Result) => a.ec.name.localeCompare(b.ec.name);
  // Real named programs edge out generic ideas on ties.
  const byCurated = (a: Result, b: Result) => Number(b.ec.curated) - Number(a.ec.curated);
  if (f.sort === "name") return rows.sort(byName);
  if (f.sort === "time")
    return rows.sort((a, b) => LEVEL[a.ec.commitment] - LEVEL[b.ec.commitment] || b.score - a.score || byCurated(a, b) || byName(a, b));
  if (f.sort === "grades")
    return rows.sort((a, b) => (b.fit ?? -1) - (a.fit ?? -1) || b.score - a.score || byCurated(a, b) || byName(a, b));
  return rows.sort((a, b) => b.score - a.score || byCurated(a, b) || byName(a, b));
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
  if (f.types.length) p.set("t", idx(TYPES, f.types));
  if (f.formats.length) p.set("f", idx(FORMATS, f.formats));
  if (f.time !== "any") p.set("time", f.time);
  if (f.strongOnly) p.set("strong", "1");
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
    types: unidx(TYPES, p.get("t")),
    formats: unidx(FORMATS, p.get("f")),
    time: time && time in LEVEL ? (time as Commitment) : "any",
    strongOnly: p.get("strong") === "1",
    q: p.get("q") ?? "",
    sort: sort === "name" || sort === "time" || sort === "grades" ? sort : "match",
  };
}
