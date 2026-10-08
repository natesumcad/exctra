# Exctra

A Next.js web app that recommends extracurricular activities (ECs) based on a student's intended major, strengths, and available time.

## Develop

```bash
npm install
npm run dev
```

- EC catalog: `lib/data.ts`: add or edit activities here.
- Scoring and grades: `lib/recommend.ts`. One matching major +5, each extra matching major +1, each matching strength +2, minus 2 per time level over budget. Grades compare against the best score for your picks.
- Pages: search at `/`, activity profiles at `/activities/[slug]`, plus `/about`, `/privacy`, `/terms`.

## Deploy

Import the repo in Vercel and it auto-detects Next.js, no config needed.
