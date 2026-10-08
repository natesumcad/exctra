import { CURATED } from "./catalog/curated";
import { generated } from "./catalog/generated";
import { SCHOLARSHIPS } from "./catalog/scholarships";
import {
  CATEGORY_CODES, COMMIT_CODES, FORMAT_CODES, MAJOR_CODES, STRENGTH_CODES, SUBJECT_CODES, TYPE_CODES,
  type Category, type Commitment, type Format, type Major, type OppType, type Row, type Strength, type Subject,
} from "./taxonomy";

export * from "./taxonomy";

export interface EC {
  slug: string;
  name: string;
  type: OppType;
  category: Category;
  majors: Major[];
  strengths: Strength[];
  subjects: Subject[];
  commitment: Commitment;
  format: Format;
  description: string;
  tip: string;
  curated: boolean;
}

export const slugify = (name: string) =>
  name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function lookup<M extends Record<string, string>>(map: M, codes: string, row: string): M[keyof M][] {
  return [...new Set(codes.split(",").map((c) => c.trim()).filter(Boolean))].map((c) => {
    if (!(c in map)) throw new Error(`Unknown code "${c}" in catalog row: ${row}`);
    return map[c as keyof M];
  });
}

function parse(row: Row, curated: boolean): EC {
  const f = row.split("|");
  if (f.length !== 10) throw new Error(`Catalog row needs 10 fields: ${row}`);
  const [name, type, cat, maj, str, sub, c, fmt, description, tip] = f;
  const one = <M extends Record<string, string>>(map: M, code: string) => lookup(map, code, row)[0];
  return {
    slug: slugify(name),
    name,
    type: one(TYPE_CODES, type),
    category: one(CATEGORY_CODES, cat),
    majors: lookup(MAJOR_CODES, maj, row),
    strengths: lookup(STRENGTH_CODES, str, row),
    subjects: lookup(SUBJECT_CODES, sub, row),
    commitment: one(COMMIT_CODES, c),
    format: one(FORMAT_CODES, fmt),
    description,
    tip,
    curated,
  };
}

function build(): EC[] {
  const all = [...CURATED.map((r) => parse(r, true)), ...SCHOLARSHIPS.map((r) => parse(r, true)), ...generated().map((r) => parse(r, false))];
  const seen = new Set<string>();
  return all.filter((ec) => (seen.has(ec.slug) ? false : (seen.add(ec.slug), true)));
}

export const ECS: EC[] = build();
const BY_SLUG = new Map(ECS.map((ec) => [ec.slug, ec]));
export const findBySlug = (slug: string) => BY_SLUG.get(slug);

/* Courses students can log grades for, grouped by subject. */
export const COURSES: Record<Subject, string[]> = {
  Math: ["Algebra 1", "Geometry", "Algebra 2", "Precalculus", "Calculus AB", "Calculus BC", "Statistics", "Multivariable Calculus"],
  "Computer Science": ["Intro to Computer Science", "AP Computer Science Principles", "AP Computer Science A", "Web Design", "Data Structures"],
  Biology: ["Biology", "AP Biology", "Anatomy and Physiology", "Marine Biology", "Genetics"],
  Chemistry: ["Chemistry", "AP Chemistry", "Organic Chemistry"],
  Physics: ["Physics", "AP Physics 1", "AP Physics 2", "AP Physics C", "Engineering Design", "Astronomy"],
  "Environmental Science": ["Earth Science", "Environmental Science", "AP Environmental Science", "Agriculture Science"],
  English: ["English 9", "English 10", "English 11", "English 12", "AP English Language", "AP English Literature", "Creative Writing", "Journalism"],
  History: ["World History", "U.S. History", "AP World History", "AP U.S. History", "AP European History", "Art History"],
  Government: ["Government", "AP U.S. Government", "AP Comparative Government", "Civics", "Law"],
  Economics: ["Economics", "AP Macroeconomics", "AP Microeconomics", "Personal Finance"],
  Psychology: ["Psychology", "AP Psychology", "Sociology"],
  "World Languages": ["Spanish", "French", "German", "Mandarin", "Japanese", "Latin", "AP Spanish", "AP French", "Other language"],
  "Visual Art": ["Art", "Drawing and Painting", "Digital Art", "Photography", "AP Art and Design", "Ceramics"],
  Music: ["Band", "Orchestra", "Choir", "Music Theory", "AP Music Theory"],
  Theater: ["Theater", "Drama", "Film Studies"],
  "Health / PE": ["Health", "Physical Education", "Sports Medicine", "Nutrition"],
  Business: ["Business", "Accounting", "Marketing", "Entrepreneurship"],
};

export const LETTER_GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"] as const;
export type LetterGrade = (typeof LETTER_GRADES)[number];
export const GRADE_POINTS: Record<LetterGrade, number> = {
  "A+": 4.3, A: 4, "A-": 3.7, "B+": 3.3, B: 3, "B-": 2.7, "C+": 2.3, C: 2, "C-": 1.7, D: 1, F: 0,
};
export const LEVELS = ["Regular", "Honors", "AP / IB", "Dual enrollment"] as const;
export type Level = (typeof LEVELS)[number];
/** Small bump for harder classes when judging subject strength. */
export const LEVEL_BONUS: Record<Level, number> = { Regular: 0, Honors: 0.15, "AP / IB": 0.3, "Dual enrollment": 0.3 };
