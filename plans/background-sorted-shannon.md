# Context

The user wants a dedicated Policy / Terms & Conditions page for the سيركل marketplace, derived from the content in `src/imports/pasted_text/platform-policy.md`. The page should be clear, well-structured, and visually consistent with the existing InfoPages (About, FAQ, How It Works, Contact).

---

## Approach

Add a `PolicyPage` export to `src/pages/InfoPages.tsx`, register it as `/policy` in `App.tsx`, and link it from the Footer.

### 1. `src/pages/InfoPages.tsx` — add `PolicyPage` export

Follow the exact same `PageShell` + `Intro` pattern already used. Structure the policy content into clearly labeled sections using the existing design tokens. Each major section from the markdown becomes an `<article>` card or a prose block.

Visual layout:
- **Intro banner** (brand purple background): eyebrow "السياسة والشروط", title "استخدم سيركل بثقة", short description.
- **Sticky side-nav** (desktop): anchor links to each section for quick navigation.
- **Sections grid** (prose cards on white bg, rounded-3xl, border-line, shadow-sm): one card per policy section using consistent headings + body text. Sections to render:
  1. من نحن — دور المنصة
  2. نموذج العمل
  3. التحقق من المستخدمين
  4. اتفاقية التأجير والمدفوعات
  5. التأمينات والودائع
  6. مسؤوليات المؤجر والمستأجر
  7. الأضرار والفقدان والنزاعات
  8. التقييمات
  9. الأنشطة المحظورة
  10. إرشادات السلامة
  11. حدود المسؤولية والتزامنا
- **Last-updated badge** at bottom.

No new dependencies needed — uses existing Lucide icons already imported in the file.

### 2. `src/App.tsx` — add route

```tsx
import { ..., PolicyPage } from './pages/InfoPages'
// inside router:
{ path: '/policy', element: <PolicyPage /> },
```

### 3. Footer link

In the existing `Footer` component inside `App.tsx`, add a link to `/policy` alongside the existing `/about`, `/how-it-works`, `/faqs`, `/contact` links.

---

## Files to modify

| File | Change |
|---|---|
| `src/pages/InfoPages.tsx` | Add `PolicyPage` export (~80–100 lines) |
| `src/App.tsx` | Import + route `/policy`, add Footer link |

---

## Verification

- Open the preview and navigate to `/policy` — page loads in RTL Arabic with correct layout.
- All 11 sections are visible and readable.
- Footer link navigates to `/policy`.
- No TypeScript errors (Vite hot-reload confirms clean compilation).
