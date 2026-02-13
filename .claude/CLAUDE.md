# Orchestree — The Everything Platform

Orchestree is a unified work platform replacing 7 tools (Notion + Linear + Asana + DocuSign + PandaDoc + Calendly + Airtable) with one product. Currently a working document signing app with upload, signature capture, and envelope management. The roadmap expands into workspace/knowledge management, project tracking, scheduling, relational databases, and AI agent teams.

UI/UX sourced from 680 analyzed flows across those 7 platforms — see `docs/DESIGN_SPEC.md` for full catalog.

## Commands

```bash
npm run dev          # Vite dev server (localhost:5173)
npm run build        # tsc -b && vite build → dist/
npm run preview      # Preview production build
npm run lint         # ESLint (flat config)
npm run test         # Vitest (watch mode)
npm run test:run     # Vitest (single run, CI)
```

**Before every commit:** `npm run build && npm run lint && npm run test:run`

## Stack

- **React 19** + **TypeScript 5.9** (strict mode) + **Vite 7**
- **Testing:** Vitest 4 + React Testing Library 16 + jsdom + user-event
- **Linting:** ESLint 9 flat config + typescript-eslint + react-hooks + react-refresh
- **Styling:** CSS custom properties with BEM naming (component-scoped `.css` files)
- **No routing library yet** — single-page app, add React Router when multi-page needed
- **No state library yet** — React `useState`/`useCallback` only, add Zustand when needed
- **No UI framework** — all components hand-built

TypeScript strict mode is on: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`. No `any`. Use `unknown` and narrow.

## Current File Structure

```
orchestree/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json / .app.json / .node.json
├── eslint.config.js
├── public/
│   └── vite.svg
├── src/
│   ├── main.tsx                        # Entry — renders <App /> in StrictMode
│   ├── index.css                       # Global styles, CSS vars, resets, buttons, modals
│   ├── App.tsx                         # Root — state management, modal routing, document CRUD
│   ├── App.css                         # App layout, view-document modal styles
│   ├── App.test.tsx                    # Root tests (renders header, dashboard, sample docs)
│   ├── types/
│   │   └── index.ts                    # Document, Signer, SignatureData types + status enums
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.tsx              # Sticky nav bar — logo, tagline, doc count badge
│   │   │   ├── Header.css
│   │   │   └── Header.test.tsx
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx           # Stat cards (total/pending/completed) + DocumentList
│   │   │   ├── Dashboard.css
│   │   │   └── Dashboard.test.tsx
│   │   ├── DocumentList/
│   │   │   ├── DocumentList.tsx        # Card grid — sorted by date, status badges, signer list, actions
│   │   │   ├── DocumentList.css
│   │   │   └── DocumentList.test.tsx
│   │   ├── DocumentUpload/
│   │   │   ├── DocumentUpload.tsx      # Drag-and-drop zone, file validation, upload flow
│   │   │   ├── DocumentUpload.css
│   │   │   └── DocumentUpload.test.tsx
│   │   └── SignaturePad/
│   │       ├── SignaturePad.tsx         # Canvas-based signature capture — draw/undo/clear/save
│   │       └── SignaturePad.css
│   └── test/
│       └── setup.ts                    # Vitest setup — imports jest-dom matchers
└── CLAUDE.md                           # This file
```

## Existing Types (`src/types/index.ts`)

```ts
DocumentStatus: 'draft' | 'pending' | 'completed'     // const object pattern
SignerStatus: 'pending' | 'signed' | 'declined'        // const object pattern

interface Signer { id, name, email, status: SignerStatus, signedAt: string | null }
interface SignatureData { dataUrl, timestamp, signerId }
interface Document { id, name, status: DocumentStatus, createdAt, fileUrl, fileType, signers: Signer[], signatures: SignatureData[] }
```

Status enums use the `const object + type extraction` pattern (not TS `enum`). Keep this pattern for all new status types.

## Existing Components — What Each Does

### Header (`components/Header/`)
- Sticky top bar, `#1A1A2E` background (Orchestree navy)
- Logo with gradient text, tagline "Digital Signatures, Simplified"
- Optional document count badge (pill shape)
- Props: `{ documentCount?: number }`

### Dashboard (`components/Dashboard/`)
- 3 stat cards: Total Documents, Pending Signatures, Completed
- "New Document" button (`#4F46E5` indigo)
- Renders `<DocumentList>` below stats
- Props: `{ documents, onNewDocument, onSign, onDelete, onView }`

### DocumentList (`components/DocumentList/`)
- Auto-fill grid of document cards (min 320px)
- Each card: name, status badge (Draft/Pending/Completed), date, signer list with status icons, action buttons
- Actions: Sign (pending only), View, Delete
- Empty state: "No documents yet. Upload one to get started."
- Props: `{ documents, onSign, onDelete, onView }`

### DocumentUpload (`components/DocumentUpload/`)
- Drag-and-drop zone with click-to-browse fallback
- File validation: type (PDF, PNG, JPG) and size (10MB default)
- Shows selected file info or error message
- Props: `{ onUpload, onCancel?, maxSize?, acceptedTypes? }`

### SignaturePad (`components/SignaturePad/`)
- HTML5 Canvas with DPR-aware rendering (ResizeObserver + devicePixelRatio scaling)
- Touch + mouse support, stroke-by-stroke undo
- Dashed border when empty, "Sign here" placeholder
- Exports signature as `dataUrl` (base64 PNG)
- Props: `{ onSave, onCancel?, width?, height?, penColor?, penSize? }`

### App (root `App.tsx`)
- Owns all state: `documents`, `modalView` ('none'|'upload'|'sign'|'view'), `signingDocId`, `viewingDoc`
- Modal system: overlay + content card pattern (defined in `index.css`)
- Sample documents pre-loaded for demo
- Document lifecycle: upload → pending → sign → completed

## Styling Conventions

**CSS custom properties** defined in `index.css :root`:
```
Colors:   --color-primary (#4f46e5), --color-success, --color-warning, --color-danger
Grays:    --color-gray-50 through --color-gray-900
App:      --bg-primary, --bg-secondary, --text-primary, --text-secondary, --text-muted, --border-color
Spacing:  --space-xs (0.25rem) through --space-2xl (3rem)
Radius:   --radius-sm (0.375rem) through --radius-xl (1rem)
Shadows:  --shadow-sm, --shadow-md, --shadow-lg
Font:     --font-sans ('Inter', system-ui)
```

**Dark mode** via `@media (prefers-color-scheme: dark)` — overrides `--bg-*`, `--text-*`, `--border-color`, `--shadow-*`, and semantic light colors.

**Per-component CSS** — each component has its own `.css` file imported at the top. Some use BEM (`signature-pad__canvas--empty`), some use flat classes (`document-card`, `stat-card`). New components should use BEM: `block__element--modifier`.

**Global button classes** in `index.css`: `.btn-primary`, `.btn-secondary`, `.btn-danger` — reuse these for consistency.

**Modal pattern** in `index.css`: `.modal-overlay` (fixed backdrop) + `.modal-content` (centered card) + `.modal-header` (title + close). Reuse this for all modals.

## Code Patterns to Follow

- **Functional components** only. Use `React.FC<Props>` or plain function with typed props.
- **Default exports** for components (this is the existing pattern — maintain it for consistency).
- **`useCallback`** on all event handlers passed as props (existing pattern throughout).
- **Component-per-folder**: `ComponentName/ComponentName.tsx` + `.css` + `.test.tsx`.
- **Types** in `src/types/index.ts` — add new interfaces/types here, not in component files.
- **Test co-location**: test file lives in the same folder as the component.
- **Testing**: React Testing Library. Query with `getByText`, `getByRole`, `getByLabelText`. Use `userEvent.setup()` for interactions, not `fireEvent`. Mock canvas/ResizeObserver in `beforeAll` when testing canvas components (see `App.test.tsx` for pattern).
- **ID generation**: `Date.now().toString(36) + Math.random().toString(36).slice(2, 8)` (see `App.tsx`).

## Testing Notes

- Vitest globals enabled — `describe`, `it`, `expect`, `vi` available without import
- Setup file: `src/test/setup.ts` imports `@testing-library/jest-dom/vitest`
- Canvas mocking pattern established in `App.test.tsx` — copy for any test that renders SignaturePad
- All 5 components have tests. **Every new component must have tests.**
- Current test count: ~25 test cases across 5 test files

## The 8 Modules (Roadmap)

The current app covers Module 03 partially (document upload, signature capture, envelope status). The full Orchestree vision has 8 modules:

| # | Module | Status | What to Build Next |
|---|--------|--------|-------------------|
| 01 | Workspace | Not started | Block editor (Tiptap/Prosemirror), pages, wiki, templates, slash commands |
| 02 | Projects | Not started | Issue tracker, board/list views, cycles, goals, keyboard shortcuts |
| 03 | Documents | **Active** | Extend: doc builder with field placement, signing flow UX, envelope tracking, audit trail, pricing tables |
| 04 | Scheduling | Not started | Event types, booking page, availability calendar, rescheduling |
| 05 | Databases | Not started | Multi-view tables (grid/kanban/calendar/gallery/form), field types, automations |
| 06 | Settings | Not started | Workspace admin, team management, theming (dark mode toggle), integrations |
| 07 | Auth | Not started | Login page, signup flow, onboarding wizard (8 steps), team invite |
| 08 | AI | Not started | Inline AI, workspace Q&A, agent teams (8 types), 1M token context memory |

When building new modules, create a folder under `src/features/<module>/` with its own `components/`, `hooks/`, `types/`, and `pages/` subfolders. Current components in `src/components/` stay there — they are the Module 03 implementation.

## Key UX Patterns (from 680 flows)

These are non-negotiable for world-class UX. Implement when building the relevant module.

### Command Palette (Cmd+K) — from Linear
Global `Cmd+K`/`Ctrl+K` opens fuzzy-search palette. Searches all content, offers quick actions, <50ms response. **Build during Shell/Layout phase.**

### Keyboard-First — from Linear
Issue creation: `C`. Assign: `A`. Priority: `P`. Status: `S`. Nav: `J`/`K` up/down. `?` opens help. **Build with Module 02 (Projects).**

### Block Editor + Slash Commands — from Notion
`/` triggers block picker. `@` mentions. `[[` links pages. **Build with Module 01 (Workspace) using Tiptap.**

### Multi-View Data — from Airtable
Same data as Grid, Kanban, Calendar, Timeline, Gallery, Form. **Build with Module 05 (Databases).**

### <100ms Interactions — from Linear
Optimistic UI: update immediately, sync background, rollback on failure. **Apply everywhere.**

### Document Signing Flow — from DocuSign
Draft → Sent → Delivered → Viewed → Signed → Completed. Guided "Next field" navigation. Extend current `DocumentStatus` enum when ready.

### Smart Booking — from Calendly
Date → time → details → confirm. Timezone auto-detect. **Build with Module 04 (Scheduling).**

### Agent Teams — Orchestree Original
Autonomous AI agents spanning all modules. Progress panel with step-by-step status, pause/edit/chat. **Build with Module 08 (AI).**

### 1M Context Memory — Orchestree Original
Persistent 1,000,000-token organizational memory. Stores workflows, preferences, decisions. Workspace-scoped, encrypted, GDPR compliant. **Build with Module 08 (AI).**

## Build Order (What to Do Next)

1. **Enhance Module 03** — add document status states (Sent, Delivered, Viewed), field placement on documents, signing ceremony UX improvements, completion certificate
2. **App Shell** — add sidebar navigation, routing (React Router), dark mode toggle, command palette (Cmd+K)
3. **Module 07 (Auth)** — login page, signup, onboarding wizard
4. **Module 01 (Workspace)** — block editor with Tiptap, page CRUD, slash commands
5. **Module 02 (Projects)** — issue tracker, board view, list view, keyboard shortcuts
6. **Module 04 (Scheduling)** — event types, booking pages, availability
7. **Module 05 (Databases)** — multi-view database engine
8. **Module 06 (Settings)** — workspace settings, theming, integrations
9. **Module 08 (AI)** — AI assistant, agent teams, 1M memory

## Design System Colors

Already established in the codebase:
```
Navy (header bg):     #1A1A2E
Indigo (primary CTA): #4F46E5 → hover #4338CA
Success green:        #059669 (vars) / #2ECC71 (dashboard) / #38A169 (signer)
Warning amber:        #D97706 (vars) / #F0A500 (dashboard)
Danger red:           #DC2626 (vars) / #E53E3E (delete)
```

Dark mode colors (via `prefers-color-scheme`):
```
Dark bg:      #0F0F1A (primary) / #1A1A2E (secondary)
Dark text:    #F1F5F9 (primary) / #94A3B8 (secondary) / #64748B (muted)
Dark border:  #334155
```

Font: `'Inter', system-ui, -apple-system, sans-serif`

## Critical Don'ts

- **Don't add dependencies without need.** The current app has zero runtime deps beyond React. Check if you can build it without a package first.
- **Don't change the types pattern.** Use `const object + type extraction` for enums (not TS `enum`).
- **Don't skip tests.** Every component gets a test file. Every test uses RTL best practices.
- **Don't break dark mode.** New styles must work with the existing `prefers-color-scheme` media query. Use CSS vars, not hardcoded colors.
- **Don't put new module code in `src/components/`.** New modules go in `src/features/<module>/`. The existing `src/components/` is the Document module.
- **Don't use `useEffect` for derived state.** Compute inline or use `useMemo`.
- **Don't forget accessibility.** Existing components use `role`, `aria-label`, `tabIndex`, `onKeyDown`, `focus-visible`. Maintain this standard.

## Reference Documents

- `docs/DESIGN_SPEC.md` — Full product specification (680 flows, 1,147 screens, 422 UI elements, 75 Mobbin-confirmed patterns from 7 platforms)
- `data/mobbin/*.xlsx` — 13 source spreadsheets with detailed flow catalogs
- This file (`CLAUDE.md`) — Engineering instructions for Claude Code
