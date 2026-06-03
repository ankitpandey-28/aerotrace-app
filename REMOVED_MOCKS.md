# Removed Mock / Demo Data

During the Memory Journal clean-up the following hardcoded demo items were removed or neutralized to ensure the page shows only real user data.

Removed demo memory entries (from `src/data.ts`):
- "Steam from the cart" (Photo)
- "Bridge jazz note" (Clip)
- "Menu tucked in pocket" (Artifact)
- "Window reflection" (Note)

Neutralized demo journey stop names and narratives in initial seed data (from `src/data.ts`):
- Removed stops: `Tea Stall Row`, `Bridge Stage`, `Book Arcade`, `Cobbled Lane`, `Back Courtyard`, `Cafe Glasshouse`, `Station Steps`, `Night Tram` — replaced with empty stops and neutral narratives.

Files changed
- `src/data.ts` — cleared `memories` array and removed demo stop names from initial journeys
- `src/pages/MemoriesPage.tsx` — removed rendering of legacy/demo memory cards; page now uses `MemoryContext` only
- `src/context/JourneyContext.tsx` — journeys now load from `localStorage` via `getSavedJourneys()` and map to `Journey` shape; legacy memories array cleared

Reasoning
- Demo content can confuse users and cause the Memory Journal to appear populated with fake data. The app should only surface real user-captured memories and saved journeys.

If you want me to also remove the demo `initialJourneys` entirely, I can clear them or flag them behind a dev flag, but I left them as fallback seed data when no saved journeys exist locally.
