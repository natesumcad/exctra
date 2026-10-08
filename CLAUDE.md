# Exctra

Next.js app on Vercel that ranks 1,000 high school opportunities by intended majors, strengths, grades, and time.

Catalog: `lib/catalog/curated.ts` (real named programs) and `lib/catalog/generated.ts` (idea lists x templates).
Rows use short codes from `lib/taxonomy.ts`; `lib/data.ts` validates them and throws on unknown codes at build.

## Deploying

Vercel deploys production from `main` on every push. The owner wants every change live right away:
after committing, run `npm run build` to confirm it passes, then push to your working branch AND to `main`
(`git push origin HEAD:main`). Never push a failing build to `main`.

## Design rules (owner's requirement)

Avoid the generic AI-generated look:
- Look: clean, green and white, futuristic. Near-white green-tinted surfaces (not pure #FFF), one emerald accent, hairline borders, mono uppercase labels.
- No gradients, neon, glows, purple/black theme, pastel or rainbow palettes.
- No drop shadows, glassmorphism, blurred orbs, dot grids, sparkle icons, or hover animations on everything.
- No decorative icons or emoji. No three-card rows or bento grids by default.
- Square edges (2px radius). Circles only for profile photos.
- Fonts: IBM Plex Sans + IBM Plex Mono, not Inter/Geist/Space Grotesk.
- Copy: no em dashes, no "it's not X, it's Y", no vague checkmark bullets, no fake testimonials.
- Include loading states, keep Privacy/Terms/404 pages working, check links don't break.

## Accounts (placeholder)

`lib/auth.tsx` is a stand-in: one demo account (username `1`, password `1`), data in localStorage
(profile, saved list, course grades, avatar as a 256px JPEG data URL).
Pages only use `useAccount()`, so real auth can replace that file later. Update the Privacy page when
account data moves to a server.
