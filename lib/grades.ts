import { COURSES, GRADE_POINTS, LEVEL_BONUS, type EC, type LetterGrade, type Level, type Subject } from "./data";

export interface CourseGrade {
  id: string;
  course: string;
  subject: Subject;
  level: Level;
  /** Null until the student taps a grade. */
  grade: LetterGrade | null;
  /** AP exam score (1-5) for AP / IB courses, if the exam has been taken. */
  apScore: number | null;
}

/** Every suggested course name with its subject, for type-to-search. */
export const COURSE_INDEX: { course: string; subject: Subject }[] = (Object.entries(COURSES) as [Subject, string[]][])
  .flatMap(([subject, list]) => list.map((course) => ({ course, subject })));

const SUBJECT_HINTS: [RegExp, Subject][] = [
  [/calc|algebra|geometr|stat|math|trig/i, "Math"],
  [/comput|coding|program|cyber|data|web/i, "Computer Science"],
  [/bio|anatomy|physiol|genetic|marine/i, "Biology"],
  [/chem/i, "Chemistry"],
  [/physic|engineer|astronom/i, "Physics"],
  [/environ|earth|ecolog|agri/i, "Environmental Science"],
  [/english|literat|writing|composition|journal|rhetoric/i, "English"],
  [/histor/i, "History"],
  [/gov|civic|law|politic/i, "Government"],
  [/econ|finance/i, "Economics"],
  [/psych|sociol/i, "Psychology"],
  [/spanish|french|german|chinese|mandarin|japanese|latin|korean|arabic|italian|language/i, "World Languages"],
  [/art|draw|paint|ceramic|photo|design/i, "Visual Art"],
  [/music|band|choir|orchestra/i, "Music"],
  [/theat|drama|film/i, "Theater"],
  [/health|\bpe\b|physical ed|sport|nutrition/i, "Health / PE"],
  [/business|account|market|entrepreneur/i, "Business"],
];

/** Best guess at a course's subject from its name; null if unknown. */
export function inferSubject(course: string): Subject | null {
  const known = COURSE_INDEX.find((c) => c.course.toLowerCase() === course.trim().toLowerCase());
  if (known) return known.subject;
  return SUBJECT_HINTS.find(([re]) => re.test(course))?.[1] ?? null;
}

/** Unweighted GPA (A+ counts as 4.0) from logged courses, or null with none. */
export function unweightedGpa(courses: CourseGrade[]): number | null {
  const graded = courses.filter((c) => c.grade);
  if (!graded.length) return null;
  return graded.reduce((t, c) => t + Math.min(4, GRADE_POINTS[c.grade!]), 0) / graded.length;
}

export type SubjectScores = Partial<Record<Subject, number>>;

/** Average grade points per subject, with a small bump for harder course levels. Capped at 4.3. */
export function subjectScores(grades: CourseGrade[]): SubjectScores {
  const sums: Partial<Record<Subject, [number, number]>> = {};
  for (const g of grades) {
    if (!g.grade) continue;
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
