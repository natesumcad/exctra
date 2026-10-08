# Exctra

A Next.js web app that searches 1,000 extracurricular opportunities and ranks them by a student's intended majors, strengths, course grades, and available time.

## Develop

```bash
npm install
npm run dev
```

- Catalog: `lib/catalog/curated.ts` (real programs) and `lib/catalog/generated.ts` (idea lists), codes in `lib/taxonomy.ts`.
- Scoring and grades: `lib/recommend.ts`. One matching major +5, each extra matching major +1, each matching strength +2, minus 2 per time level over budget. Grades compare against the best score for your picks.
- Pages: search at `/`, activity profiles at `/activities/[slug]`, plus `/about`, `/privacy`, `/terms`.

## Deploy

Import the repo in Vercel and it auto-detects Next.js, no config needed.
