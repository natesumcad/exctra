/* Shared vocabularies. Catalog rows refer to these by short code. */

export const MAJOR_CODES = {
  cs: "Computer Science",
  ds: "Data Science",
  eng: "Engineering",
  math: "Mathematics",
  bio: "Biology / Pre-Med",
  nur: "Nursing / Health Sciences",
  chem: "Chemistry / Physics",
  env: "Environmental Science",
  ag: "Agriculture / Animal Science",
  psy: "Psychology",
  bus: "Business / Economics",
  law: "Political Science / Law",
  ir: "International Relations",
  hist: "History",
  phil: "Philosophy",
  wri: "English / Writing",
  jour: "Journalism / Media",
  film: "Film",
  art: "Art / Design",
  arch: "Architecture",
  mus: "Music / Performing Arts",
  edu: "Education",
  lang: "Languages / Linguistics",
  kin: "Sports Science / Kinesiology",
  und: "Undecided",
} as const;

export const STRENGTH_CODES = {
  lead: "Leadership",
  speak: "Public speaking",
  write: "Writing",
  math: "Math & logic",
  code: "Coding",
  build: "Building / hands-on",
  res: "Research",
  create: "Creativity",
  team: "Teamwork",
  help: "Empathy / helping others",
  org: "Organization",
  comp: "Competition",
} as const;

export const SUBJECT_CODES = {
  m: "Math",
  c: "Computer Science",
  b: "Biology",
  ch: "Chemistry",
  p: "Physics",
  es: "Environmental Science",
  e: "English",
  h: "History",
  g: "Government",
  ec: "Economics",
  ps: "Psychology",
  l: "World Languages",
  a: "Visual Art",
  mu: "Music",
  t: "Theater",
  he: "Health / PE",
  bu: "Business",
} as const;

export const CATEGORY_CODES = {
  stem: "STEM",
  health: "Health",
  biz: "Business",
  civ: "Civics & Debate",
  hum: "Humanities",
  media: "Writing & Media",
  arts: "Arts",
  env: "Environment",
  svc: "Service",
  ath: "Athletics",
} as const;

export const TYPE_CODES = {
  comp: "Competition",
  summer: "Summer program",
  club: "Club",
  lead: "Leadership role",
  vol: "Volunteering",
  work: "Job / internship",
  res: "Research",
  proj: "Independent project",
  course: "Online course",
} as const;

export const FORMAT_CODES = { o: "Online", p: "In person", b: "Online or in person" } as const;
export const COMMIT_CODES = { L: "low", M: "medium", H: "high" } as const;

export type MajorCode = keyof typeof MAJOR_CODES;
export type StrengthCode = keyof typeof STRENGTH_CODES;
export type SubjectCode = keyof typeof SUBJECT_CODES;
export type CategoryCode = keyof typeof CATEGORY_CODES;
export type TypeCode = keyof typeof TYPE_CODES;
export type FormatCode = keyof typeof FORMAT_CODES;

export type Major = (typeof MAJOR_CODES)[MajorCode];
export type Strength = (typeof STRENGTH_CODES)[StrengthCode];
export type Subject = (typeof SUBJECT_CODES)[SubjectCode];
export type Category = (typeof CATEGORY_CODES)[CategoryCode];
export type OppType = (typeof TYPE_CODES)[TypeCode];
export type Format = (typeof FORMAT_CODES)[FormatCode];
export type Commitment = (typeof COMMIT_CODES)[keyof typeof COMMIT_CODES];

export const MAJORS = Object.values(MAJOR_CODES) as Major[];
export const STRENGTHS = Object.values(STRENGTH_CODES) as Strength[];
export const SUBJECTS = Object.values(SUBJECT_CODES) as Subject[];
export const CATEGORIES = Object.values(CATEGORY_CODES) as Category[];
export const TYPES = Object.values(TYPE_CODES) as OppType[];
export const FORMATS: Format[] = ["Online", "In person"];

export const HOURS: Record<Commitment, string> = { low: "1 to 3 hrs/wk", medium: "4 to 8 hrs/wk", high: "9+ hrs/wk" };

/** Raw catalog row: "name|type|category|majors|strengths|subjects|L/M/H|o/p/b|description|tip" (lists are comma separated codes). */
export type Row = string;
