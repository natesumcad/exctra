# Exctra

A Next.js web app that recommends extracurricular activities (ECs) based on a student's intended major, strengths, and available time.

## Develop

```bash
npm install
npm run dev
```

- EC catalog: `lib/data.ts` — add or edit activities here.
- Scoring: `lib/recommend.ts` — major match (+5), each matching strength (+2), penalty for exceeding the chosen time commitment.

## Deploy

Import the repo in Vercel — it auto-detects Next.js, no config needed.
