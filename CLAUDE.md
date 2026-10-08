# Exctra

Next.js app on Vercel that ranks high school extracurriculars by intended major, strengths, and time.

## Deploying

Vercel deploys production from `main` on every push. The owner wants every change live right away:
after committing, run `npm run build` to confirm it passes, then push to your working branch AND to `main`
(`git push origin HEAD:main`). Never push a failing build to `main`.

## Design rules (owner's requirement)

Avoid the generic AI-generated look:
- No gradients, neon, purple/black theme, pastel or rainbow palettes. One accent color (ink green) used with meaning.
- No pure white backgrounds; keep the paper/surface layering.
- No drop shadows, glassmorphism, blurred orbs, dot grids, sparkle icons, or hover animations on everything.
- No decorative icons or emoji. No three-card rows or bento grids by default.
- Small corner radii (3-4px), not soft rounded-xl everywhere.
- Fonts: Source Serif 4 + IBM Plex Sans, not Inter/Geist/Space Grotesk.
- Copy: no em dashes, no "it's not X, it's Y", no vague checkmark bullets, no fake testimonials.
- Include loading states, keep Privacy/Terms/404 pages working, check links don't break.

## Accounts (placeholder)

`lib/auth.tsx` is a stand-in: one demo account (username `1`, password `1`), data in localStorage.
Pages only use `useAccount()`, so real auth can replace that file later. Update the Privacy page when
account data moves to a server.
