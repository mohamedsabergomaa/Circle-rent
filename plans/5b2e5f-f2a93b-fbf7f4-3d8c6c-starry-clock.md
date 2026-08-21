# Circle — Arabic (RTL) Rental Marketplace Homepage

## Context
The brief describes **Circle**, a peer-to-peer rental marketplace, with an exact wireframe-derived
section hierarchy. The user now wants this built:
- **In Arabic**, fully **RTL**
- Typeset in **IBM Plex Sans Arabic**
- Using a new 5-color palette:
  - `#5B2E5F` deep plum — **primary brand**
  - `#F2A93B` amber — accent (prices / highlights)
  - `#FBF7F4` warm off-white — **page background**
  - `#3D8C6C` green — positive/verified/trust accent
  - `#D1495B` rose — favorite/save + alert accent

The current `src/App.tsx` is a placeholder dot-grid scaffold (not a real app), so it is replaced
with the marketplace homepage. This is a Vite + React 19 + Tailwind v4 project; styling goes in JSX
utility classes with theme tokens/font wiring in `src/index.css`.

## Approach

### Fonts & RTL wiring (`src/index.css`)
- Add Google Fonts `@import` for **IBM Plex Sans Arabic** (weights 400/500/600/700) as the first
  non-comment statement.
- Register palette + font as Tailwind v4 theme tokens via `@theme` (e.g. `--color-brand`,
  `--color-amber`, `--color-cream`, `--color-green`, `--color-rose`, `--font-sans`).
- Set `body`/`:root` default font to IBM Plex Sans Arabic and warm-cream background.
- Set `dir="rtl"` and `lang="ar"` on the root element (in `App.tsx` root div) so the whole layout
  mirrors correctly; section-header arrows point right→left (`←` visual direction).

### Aesthetic
Before writing UI, invoke `Skill('make:aesthetic-stance')` to commit a stance and confirm the font
pairing/craft details, then implement directly. No `create_make_theme` needed beyond the given
palette (palette + font are user-specified). Premium, minimal marketplace: cream background, plum
typography for brand, generous whitespace, thin `border` dividers, subtle rounded corners, minimal
shadows, no gradients.

### Structure (single-file build in `src/App.tsx`, with local components)
Preserve the exact wireframe hierarchy. All Arabic copy, RTL. Build these reusable local components:

1. **Header** — Circle logo (circular mark + "سيركل" wordmark), nav links
   (من نحن / كيف يعمل / الأسئلة الشائعة / تواصل معنا), hamburger for mobile. Thin divider below.
2. **Hero** — centered heading "استأجر ما تحتاجه." + supporting line
   "اكتشف الأشياء التي يؤجّرها من حولك." + large rounded search bar with two fields
   (ماذا تريد أن تستأجر؟ / الموقع) and a search icon. No hero image, no extra CTA. Divider below.
3. **ListingCard** (the key reusable component) — item image, name, short category, price
   (`ج.م ١٥٠ / يوم` styled with amber accent), location with pin icon, small owner avatar + rating,
   and a heart/save toggle (rose when saved). Hover state = subtle lift/border emphasis.
4. **SectionHeader** — title + directional arrow (لك خصيصًا، مقترح لك، أُضيف حديثًا).
5. Three listing rows, **exactly 5 cards each**, horizontal (responsive: scroll/wrap on small
   screens while keeping row semantics):
   - **لك خصيصًا** (For You)
   - **مقترح لك** (Recommended)
   - **أُضيف حديثًا** (Recently Added)
   Real rental items translated to Arabic (كاميرا سوني، مثقاب كهربائي، بلايستيشن ٥، سماعة دي جيه،
   خيمة تخييم، عدسة كانون، طقم عدد كهربائية، بروجكتر، إلخ). Use Unsplash for real product imagery
   (via `Skill('make:unsplash')`).
6. **Footer** — three columns (RTL order): brand column (logo, tagline
   "استأجر ما تحتاجه. اربح مما تملك."، two small activity cards, four social icons), "سيركل" links
   column, "للمستخدمين" links column.
7. **Copyright** — divider + centered `© ٢٠٢٦ سيركل. جميع الحقوق محفوظة.`

### Icons
Use `lucide-react` (install if not present) for search, map pin, heart, star, menu, and social icons.

## Files
- `src/App.tsx` — replace scaffold with the full homepage + local components (Header, Hero,
  ListingCard, SectionHeader, Footer). Keep default export.
- `src/index.css` — add font `@import`, `@theme` palette/font tokens, base body styles.
- `package.json` — add `lucide-react` if missing.

## Verification
- Vite dev server is already running; open the preview and visually confirm:
  - Layout mirrors RTL correctly; Arabic renders in IBM Plex Sans Arabic.
  - Exact section order and 5 cards per row.
  - Palette applied per Balanced direction (plum primary, amber prices, rose save, green trust).
  - Responsive: header collapses to hamburger, card rows behave on narrow widths.
- Optional: check `figma logs` only if a runtime error appears.
