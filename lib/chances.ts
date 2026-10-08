import type { College, ProgramKey } from "./colleges";
import type { EC, Major } from "./data";

/*
 * A transparent, rule-based estimate. It starts from each college's overall admit rate and
 * shifts the odds up or down based on how the student compares with typical admits.
 * It can't see essays, recommendations, or context, so results are rough by design.
 */

export const AP_EXAMS = [
  "African American Studies", "Art History", "Biology", "Calculus AB", "Calculus BC", "Chemistry",
  "Chinese Language", "Comparative Government", "Computer Science A", "Computer Science Principles",
  "Drawing", "2-D Art and Design", "3-D Art and Design", "English Language", "English Literature",
  "Environmental Science", "European History", "French Language", "German Language", "Human Geography",
  "Italian Language", "Japanese Language", "Latin", "Macroeconomics", "Microeconomics", "Music Theory",
  "Physics 1", "Physics 2", "Physics C: Mechanics", "Physics C: Electricity and Magnetism", "Precalculus",
  "Psychology", "Research", "Seminar", "Spanish Language", "Spanish Literature", "Statistics",
  "U.S. Government", "U.S. History", "World History",
] as const;

export const AWARD_LEVELS = {
  none: { label: "None yet", pts: 0 },
  school: { label: "School level", pts: 0.5 },
  regional: { label: "Regional or county", pts: 1 },
  state: { label: "State", pts: 2 },
  national: { label: "National", pts: 3.5 },
  international: { label: "International", pts: 5 },
} as const;
export type AwardLevel = keyof typeof AWARD_LEVELS;

export interface ApScore { id: string; exam: string; score: number }

export interface Applicant {
  major: Major | "";
  gpa: number | null; // unweighted, 4.0 scale
  sat: number | null; // best of SAT and ACT (converted)
  apCount: number;
  apAvg: number | null;
  activities: EC[]; // activities marked Joined
  award: AwardLevel;
}

/* ACT composite to SAT total, from the 2018 ACT/SAT concordance tables (rounded). */
const ACT_TO_SAT: Record<number, number> = {
  36: 1590, 35: 1540, 34: 1500, 33: 1460, 32: 1430, 31: 1400, 30: 1370, 29: 1340, 28: 1310, 27: 1280,
  26: 1240, 25: 1210, 24: 1180, 23: 1140, 22: 1110, 21: 1080, 20: 1040, 19: 1010, 18: 970, 17: 930,
  16: 890, 15: 850, 14: 800, 13: 760, 12: 710, 11: 670, 10: 630, 9: 590,
};
export const actToSat = (act: number) => ACT_TO_SAT[Math.max(9, Math.min(36, Math.round(act)))];

const MAJOR_PROGRAM: Partial<Record<Major, ProgramKey>> = {
  "Computer Science": "cs",
  "Data Science": "cs",
  Engineering: "eng",
  "Nursing / Health Sciences": "nur",
  "Business / Economics": "bus",
};

const STRONG_TYPES = new Set(["Competition", "Research", "Leadership role", "Summer program", "Scholarship"]);

/** Activity strength: depth and relevance of what the student has actually done. */
export function activityPoints(activities: EC[], major: Major | "", award: AwardLevel) {
  let pts = AWARD_LEVELS[award].pts;
  for (const ec of activities) {
    pts += 1;
    if (ec.curated) pts += 0.5;
    if (STRONG_TYPES.has(ec.type)) pts += 0.5;
    if (major && ec.majors.includes(major)) pts += 0.5;
    if (ec.commitment === "high") pts += 0.5;
  }
  return pts;
}

export type Band = "Likely" | "Target" | "Reach" | "Far reach";
export interface Factor { label: string; effect: number; note: string }
export interface Estimate { p: number; band: Band; factors: Factor[]; warnings: string[] }

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const logit = (p: number) => Math.log(p / (1 - p));
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

export function bandFor(p: number): Band {
  if (p >= 0.7) return "Likely";
  if (p >= 0.35) return "Target";
  if (p >= 0.1) return "Reach";
  return "Far reach";
}

export function estimate(c: College, a: Applicant): Estimate | null {
  if (a.gpa === null) return null;
  if (c.admitRate >= 0.99) {
    return { p: 0.99, band: "Likely", warnings: [], factors: [{ label: "Open admission", effect: 0, note: "Accepts all high school graduates." }] };
  }
  // Competitive majors start from a lower admit rate than the school overall.
  const prog = a.major ? MAJOR_PROGRAM[a.major] : undefined;
  const level = prog ? c.tough[prog] : undefined;
  const r = c.admitRate * (level === 2 ? 0.3 : level === 1 ? 0.65 : 1);
  const factors: Factor[] = [];
  const warnings: string[] = [];
  const selective = r < 0.15 ? 2 : r < 0.4 ? 1 : 0;

  // Grades vs. typical admits.
  const gpaZ = clamp((a.gpa - c.gpa) / 0.3, -3, 1.5);
  const usesTest = c.policy !== "blind";
  const hasTest = usesTest && a.sat !== null && c.sat !== null;
  const gpaW = hasTest ? 0.9 : 1.2;
  factors.push({ label: "GPA", effect: gpaW * gpaZ, note: `${a.gpa.toFixed(2)} vs. about ${c.gpa.toFixed(2)} typical` });

  // Test scores.
  if (c.policy === "blind") {
    factors.push({ label: "Test scores", effect: 0, note: "Not considered at this school" });
  } else if (hasTest) {
    const [lo, hi] = c.sat!;
    const z = clamp((a.sat! - (lo + hi) / 2) / ((hi - lo) / 1.35), -3, 1.5);
    factors.push({ label: "Test scores", effect: 0.7 * z, note: `${a.sat} vs. middle 50% of ${lo} to ${hi}` });
  } else if (c.policy === "required") {
    factors.push({ label: "Test scores", effect: -2.5, note: "Required here, and you haven't added a score" });
    warnings.push("This school requires the SAT or ACT.");
  } else {
    factors.push({ label: "Test scores", effect: -0.15, note: "Test-optional; applying without a score" });
  }

  // Course rigor: AP load and exam scores.
  const expectAp = [3, 5, 8][selective];
  let rigor = clamp((a.apCount - expectAp) / 3, -1.5, 1);
  if (a.apAvg !== null) rigor += a.apAvg >= 4 ? 0.3 : a.apAvg < 3 ? -0.3 : 0;
  factors.push({
    label: "Course rigor",
    effect: 0.35 * rigor,
    note: `${a.apCount} AP${a.apCount === 1 ? "" : "s"}${a.apAvg !== null ? `, average exam score ${a.apAvg.toFixed(1)}` : ""}; about ${expectAp}+ is common here`,
  });

  // Activities and awards.
  const ec = activityPoints(a.activities, a.major, a.award);
  const expectEc = [3, 6, 10][selective];
  factors.push({
    label: "Activities and awards",
    effect: 0.6 * clamp((ec - expectEc) / 3, -2, 1.5),
    note: `${a.activities.length} joined, strength ${ec.toFixed(1)} vs. about ${expectEc} typical`,
  });

  if (level) {
    factors.push({
      label: "Major",
      effect: level === 2 ? -1.2 : -0.45,
      note: `${a.major} is ${level === 2 ? "much " : ""}harder to get into here; estimated starting rate about ${Math.max(1, Math.round(r * 100))}% instead of ${Math.round(c.admitRate * 100)}%`,
    });
  }

  // The Major factor is shown for explanation; its effect is already in the starting rate.
  const shift = factors.filter((f) => f.label !== "Major").reduce((t, f) => t + f.effect, 0);
  // Very selective schools stay uncertain even for perfect applicants.
  const cap = r < 0.25 ? Math.min(0.9, r * 4 + 0.03) : 0.97;
  const p = clamp(sigmoid(logit(r) + 0.7 * shift), 0.005, cap);
  return { p, band: bandFor(p), factors, warnings };
}

export function effectLabel(e: number) {
  if (e >= 0.6) return "Helps a lot";
  if (e >= 0.15) return "Helps";
  if (e > -0.15) return "Neutral";
  if (e > -0.6) return "Hurts";
  return "Hurts a lot";
}
