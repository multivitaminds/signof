# SignOf ✓

**The Everything Platform** — one app replacing Notion, Linear, Asana, DocuSign, PandaDoc, Calendly, and Airtable.

## Current State

A working document signing application with:

- **Dashboard** — stat cards showing total, pending, and completed documents
- **Document Upload** — drag-and-drop with file type/size validation (PDF, PNG, JPG up to 10MB)
- **Signature Capture** — HTML5 Canvas with DPR-aware rendering, touch support, stroke undo
- **Document Lifecycle** — Draft → Pending → Completed with signer tracking
- **Dark Mode** — automatic via `prefers-color-scheme`
- **Responsive** — mobile-friendly layouts across all components
- **Tested** — ~25 test cases across 5 components using Vitest + React Testing Library

## Quick Start

```bash
npm install
npm run dev        # → localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (tsc + vite) |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run test` | Tests (watch mode) |
| `npm run test:run` | Tests (single run) |
| `npm run test:coverage` | Tests with coverage |
| `npm run typecheck` | TypeScript check |
| `npm run check` | All checks (typecheck + lint + test) |

## Tech Stack

- **React 19** + **TypeScript 5.9** (strict mode)
- **Vite 7** — fast builds, HMR
- **Vitest 4** + **React Testing Library** — testing
- **ESLint 9** — flat config with typescript-eslint
- **CSS Custom Properties** — component-scoped stylesheets with dark mode

## Project Structure

```
src/
├── main.tsx                    # App entry
├── App.tsx                     # Root — state, modals, document CRUD
├── index.css                   # Global styles, CSS vars, dark mode
├── types/
│   └── index.ts                # Document, Signer, SignatureData types
├── components/
│   ├── Header/                 # Sticky nav — logo, tagline, doc count
│   ├── Dashboard/              # Stat cards + document grid
│   ├── DocumentList/           # Card grid with status badges + actions
│   ├── DocumentUpload/         # Drag-and-drop upload zone
│   └── SignaturePad/           # Canvas-based signature capture
└── test/
    └── setup.ts                # Vitest + jest-dom setup
```

## Roadmap

SignOf will expand into 8 modules:

| Module | Status |
|--------|--------|
| Documents & E-Signatures | ✅ Active |
| Workspace & Knowledge Hub | Planned |
| Project & Issue Tracking | Planned |
| Scheduling & Calendar | Planned |
| Relational Databases | Planned |
| Settings & Admin | Planned |
| Auth & Onboarding | Planned |
| AI Agent Teams | Planned |

Design sourced from **680 user flows** across 7 platforms via Mobbin.com. See `docs/DESIGN_SPEC.md` for the complete specification.

## License

Proprietary. All rights reserved.
