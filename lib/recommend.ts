import { ECS, type Commitment, type EC, type Major, type Strength } from "./data";

export interface Answers {
  major: Major;
  strengths: Strength[];
  commitment: Commitment;
}

export interface Result {
  ec: EC;
  score: number;
  reasons: string[];
}

const LEVEL: Record<Commitment, number> = { low: 0, medium: 1, high: 2 };

export function recommend({ major, strengths, commitment }: Answers, limit = 8): Result[] {
  return ECS.map((ec) => {
    const reasons: string[] = [];
    let score = 0;

    if (ec.majors.includes(major)) {
      score += 5;
      reasons.push(`Fits ${major}`);
    }
    const matched = ec.strengths.filter((s) => strengths.includes(s));
    score += matched.length * 2;
    if (matched.length) reasons.push(`Uses your ${matched.join(", ").toLowerCase()}`);

    const over = LEVEL[ec.commitment] - LEVEL[commitment];
    if (over > 0) score -= over * 2;
    else reasons.push(`Fits your schedule`);

    return { ec, score, reasons };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
