import { ECS, MAJORS, STRENGTHS, type Commitment, type EC, type Major, type Strength } from "./data";

export interface Answers {
  major: Major;
  strengths: Strength[];
  commitment: Commitment;
}

export interface Result {
  ec: EC;
  score: number;
  majorFit: boolean;
  matched: Strength[];
  overTime: number;
}

const LEVEL: Record<Commitment, number> = { low: 0, medium: 1, high: 2 };

export function recommend({ major, strengths, commitment }: Answers, limit = 8): Result[] {
  return ECS.map((ec) => {
    const majorFit = ec.majors.includes(major);
    const matched = ec.strengths.filter((s) => strengths.includes(s));
    const overTime = Math.max(0, LEVEL[ec.commitment] - LEVEL[commitment]);
    const score = (majorFit ? 5 : 0) + matched.length * 2 - overTime * 2;
    return { ec, score, majorFit, matched, overTime };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/* Answers <-> URL query, so results can be shared as a link. */
export function toQuery({ major, strengths, commitment }: Answers): string {
  const p = new URLSearchParams({ major, time: commitment });
  if (strengths.length) p.set("s", strengths.map((s) => STRENGTHS.indexOf(s)).join("."));
  return p.toString();
}

export function fromQuery(search: string): Answers | null {
  const p = new URLSearchParams(search);
  const major = p.get("major") as Major;
  const time = p.get("time") as Commitment;
  if (!MAJORS.includes(major) || !(time in LEVEL)) return null;
  const strengths = (p.get("s") ?? "")
    .split(".")
    .map((i) => STRENGTHS[Number(i)])
    .filter((s): s is Strength => Boolean(s));
  return { major, strengths, commitment: time };
}
