import { GRADE_POINTS, LEVEL_BONUS, type EC, type LetterGrade, type Level, type Subject } from "./data";

export interface CourseGrade {
  id: string;
  course: string;
  subject: Subject;
  level: Level;
  grade: LetterGrade;
}

export type SubjectScores = Partial<Record<Subject, number>>;

/** Average grade points per subject, with a small bump for harder course levels. Capped at 4.3. */
export function subjectScores(grades: CourseGrade[]): SubjectScores {
  const sums: Partial<Record<Subject, [number, number]>> = {};
  for (const g of grades) {
    const pts = Math.min(4.3, GRADE_POINTS[g.grade] + LEVEL_BONUS[g.level]);
    const [t, n] = sums[g.subject] ?? [0, 0];
    sums[g.subject] = [t + pts, n + 1];
  }
  return Object.fromEntries(Object.entries(sums).map(([s, [t, n]]) => [s, t / n])) as SubjectScores;
}

/** How well a student's grades line up with an opportunity's subjects, or null if no overlap. */
export function gradeFit(ec: EC, scores: SubjectScores): { fit: number; subjects: Subject[] } | null {
  const subjects = ec.subjects.filter((s) => scores[s] !== undefined);
  if (!subjects.length) return null;
  return { fit: subjects.reduce((t, s) => t + scores[s]!, 0) / subjects.length, subjects };
}

export function pointsToLetter(p: number): string {
  if (p >= 4.15) return "A+";
  if (p >= 3.85) return "A";
  if (p >= 3.5) return "A-";
  if (p >= 3.15) return "B+";
  if (p >= 2.85) return "B";
  if (p >= 2.5) return "B-";
  if (p >= 2.15) return "C+";
  if (p >= 1.85) return "C";
  if (p >= 1.5) return "C-";
  if (p >= 0.5) return "D";
  return "F";
}

export const STRONG_THRESHOLD = 3.5; // A- or better
