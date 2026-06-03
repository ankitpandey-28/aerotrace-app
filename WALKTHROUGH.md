#! AeroTrace — Walkthrough for sharing with ChatGPT

Purpose
- A compact guide to run, inspect, and share this repo with ChatGPT or another reviewer.

Quick links (paths)
- App entry: `src/main.tsx`
- Memories Reel page: `src/pages/MemoriesReelPage.tsx`
- Memories UI: `src/pages/MemoriesPage.tsx`
- Reel components: `src/components/memory/ReelCard.tsx`, `src/components/memory/ReelDetailModal.tsx`, `src/components/memory/PolaroidPhoto.tsx`
- Context providers: `src/context/JourneyContext.tsx`, `src/context/MemoryContext.tsx`, `src/context/NavigationContext.tsx`
- Data seed: `src/data.ts`
- README: `README.md`
- Roadmap: `ROADMAP.md`

Run locally (copy/paste)
```bash
git clone https://github.com/ankitpandey-28/aerotrace-app.git
cd aerotrace-app
npm install
# dev server
npm run dev
# build + preview
npm run build
npm run preview
# type-check
npx tsc --noEmit
```

Open the Memories Reel page
- In the running app open: `http://localhost:5173/#/memories-reel` (or the port shown by `npm run dev`).

What to verify (quick checklist)
- [ ] `npm run build` completes without errors
- [ ] `npx tsc --noEmit` produces no type errors
- [ ] Dev server runs and `/#/memories-reel` shows grouped reels by month
- [ ] Clicking a reel opens a cinematic detail modal
- [ ] Polaroid photo stack renders when memories exist

Data flow notes
- `JourneyContext` holds `journeys`, `memories` (legacy), `discoveries`, and active tracking state.
- `MemoryContext` manages enhanced `Memory` objects with `photos`, `note`, `mood`, and optional `journeyId`.
- `MemoriesReelPage` groups `journeys` where `status === 'Completed'` by month and renders `ReelCard` for each.
- `ReelDetailModal` consumes a `Journey` and lists related `discoveries` via `sourceJourneyId`.

Files to inspect for changes
- New: `src/pages/MemoriesReelPage.tsx`
- New: `src/components/memory/ReelCard.tsx`
- New: `src/components/memory/ReelDetailModal.tsx`
- Updated: `src/types.ts`, `src/context/NavigationContext.tsx`, `src/components/layout/Header.tsx`, `README.md`, `ROADMAP.md`

How to share with ChatGPT (suggested prompt template)
"I have a TypeScript React app (Vite/Tailwind) in this repository: <repo-url>. I added a feature called 'Memories Reel' in `src/pages/MemoriesReelPage.tsx`. Please review the implementation and suggest improvements for: code quality, accessibility, UX for the detail modal, performance optimizations, and testing strategy. Relevant files: list above. Build output: (paste `npm run build` output). Type-check output: (paste `npx tsc --noEmit` output)."

Example shorter prompt to paste into ChatGPT:
"Repo: <repo-url>. Goal: make the Memories Reel more story-first and mobile-friendly. Files: `src/pages/MemoriesReelPage.tsx`, `src/components/memory/ReelCard.tsx`, `src/components/memory/ReelDetailModal.tsx`. Please propose UI/UX changes, accessibility fixes, and a list of code edits (diffs) to implement them."

Hints when sharing logs or screenshots
- Include the `dist` build errors (if any) and the exact `npx tsc --noEmit` output.
- Attach screenshots of the modal and reel page (use `assets/screenshots/*`) or paste small base64 images/links.

Recommended next asks for ChatGPT
- "Audit this code for accessibility (keyboard, screen reader)."
- "Suggest how to lazy-load the reel detail modal and reduce initial bundle size."
- "Create unit tests for `ReelCard` and `ReelDetailModal` with Vitest/React Testing Library."

Commit & push
- I added this file as `WALKTHROUGH.md` in the repo root. Commit present on branch `main`.

Contact / context
- Repo root: `c:/Users/wwwan/Desktop/PROJECT/AEROTRACE`
- Primary dev commands: `npm run dev`, `npm run build`, `npx tsc --noEmit`

If you want, I can also generate a minimal ChatGPT-ready paste (single message) that includes the most relevant files and a focused prompt — tell me the target audience (code review, design critique, or feature expansion).
