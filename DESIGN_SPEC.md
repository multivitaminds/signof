# CLAUDE.md — SignOf™ Platform Specification

> **Version:** 2.0 · **Date:** February 9, 2026 · **Classification:** Confidential
> **Target Valuation:** $1,000,000,000,000 (One Trillion Dollars)
> **Design DNA:** 680 flows · 1,147 screens · 422 UI elements · 75 Mobbin-confirmed patterns
> **Source Platforms:** Airtable · Asana · Calendly · DocuSign · Linear · Notion · PandaDoc

---

## Table of Contents

1. [Vision & Mission](#1-vision--mission)
2. [The $1T Thesis](#2-the-1t-thesis)
3. [Research Foundation](#3-research-foundation)
4. [Core Design Principles](#4-core-design-principles)
5. [Design System](#5-design-system)
6. [Platform Architecture](#6-platform-architecture)
7. [Module 01: Smart Workspace & Knowledge Hub](#7-module-01)
8. [Module 02: Project & Issue Tracking Engine](#8-module-02)
9. [Module 03: Document Automation & E-Signature Suite](#9-module-03)
10. [Module 04: Scheduling & Calendar Intelligence](#10-module-04)
11. [Module 05: Relational Database & Workflow Engine](#11-module-05)
12. [Module 06: Universal Settings & Administration](#12-module-06)
13. [Module 07: Onboarding & Authentication](#13-module-07)
14. [Module 08: AI Command Center](#14-module-08)
15. [Agent Teams & 1M Context Memory](#15-agent-teams--1m-context-memory)
16. [Mobile Experience](#16-mobile-experience)
17. [Cross-Platform Feature Mapping](#17-cross-platform-feature-mapping)
18. [Component Library](#18-component-library)
19. [Interaction Design & Micro-Animations](#19-interaction-design)
20. [Accessibility & i18n](#20-accessibility--i18n)
21. [Performance & Technical Architecture](#21-performance--technical-architecture)
22. [Security & Compliance](#22-security--compliance)
23. [Growth & Monetization](#23-growth--monetization)
24. [Competitive Moat Analysis](#24-competitive-moat)
25. [Appendix A: Complete Flow Catalog (680 Flows)](#25-appendix-a)
26. [Appendix B: UI Element Taxonomy](#26-appendix-b)
27. [Appendix C: Mobbin-Confirmed Patterns](#27-appendix-c)

---

## 1. Vision & Mission

### Vision
**SignOf is the platform where teams think, build, sign, and ship — together.**

SignOf replaces the fragmented SaaS landscape by unifying knowledge management, project tracking, document automation, legally-binding e-signatures, intelligent scheduling, relational databases, and AI assistance into a single, breathtakingly designed experience.

### Mission
Eliminate the "SaaS tax" — the hidden cost of context-switching between 7+ disconnected tools — by creating the world's first truly unified work platform. Every feature feels native, not bolted-on. Every workflow flows into the next without friction.

### The Name
**SignOf** — the final sign-off on everything: documents signed, projects approved, deals closed, meetings confirmed. One platform. One sign-off.

---

## 2. The $1T Thesis

### Market Capture Strategy

| Market | Incumbent | Market Size | SignOf Advantage |
|--------|-----------|-------------|------------------|
| Knowledge Management | Notion ($10B) | $15B+ | Integrated with projects, docs & signing |
| Project Management | Asana ($5B) + Linear ($1B) | $12B+ | Speed-first + enterprise workflows |
| E-Signatures | DocuSign ($12B) | $7B+ | Built-in, not bolted-on |
| Document Automation | PandaDoc ($1B+) | $5B+ | Unified editor with signing & payment |
| Scheduling | Calendly ($3B) | $4B+ | Native to workspace, not external |
| Databases & Workflows | Airtable ($11B) | $11B+ | Relational data + docs + projects |
| AI Productivity | Multiple | $25B+ | Full-context AI across all workflows |
| **TOTAL ADDRESSABLE** | | **$79B+** | **Winner-take-most** |

### Why $1T is Achievable

1. **Platform consolidation premium** — replacing 7 tools creates 20-30x revenue per customer vs. single-point solutions
2. **Network effects** — every user increases value for all users (shared workspaces, richer templates, more scheduling availability)
3. **Data gravity** — once a team's knowledge, projects, documents, and signatures live in SignOf, switching costs are astronomical
4. **AI context monopoly** — owning the full workflow gives SignOf's AI unprecedented context that no single-purpose tool can match
5. **Agent Teams** — autonomous AI agents that operate across all modules simultaneously, creating a new "AI workforce" category
6. **1,000,000 token context memory** — persistent organizational memory that makes the platform smarter with every interaction

---

## 3. Research Foundation

### Methodology

This specification is built on systematic analysis of 13 app versions across 7 world-class platforms, cataloged via Mobbin.com:

| Platform | iOS Flows | Web Flows | Screens | Confirmed ★ |
|----------|-----------|-----------|---------|-------------|
| Airtable | 59 | 59 | — | 3 |
| Asana | 63 | 74 | — | 13 |
| Calendly | 31 | 68 | 152 | 31 |
| DocuSign | 36 | 92 | — | 0 |
| Linear | 37 | 44 | 370 | 7 |
| Notion | 37 | 42 | 433 | 18 |
| PandaDoc | — | 38 | 192 | 3 |
| **TOTALS** | **263** | **417** | **1147** | **75** |

### Source Spreadsheets (13 Files)

- `airtable_ios_mobbin_flows.xlsx` — 59 flows, 10 sections
- `airtable_web_mobbin_flows.xlsx` — 59 flows, 12 sections
- `asana_ios_mobbin_flows.xlsx` — 63 flows, 11 sections
- `asana_web_mobbin_flows.xlsx` — 74 flows, 13 sections
- `calendly_ios_mobbin_flows.xlsx` — 31 flows, 152 screens, 5 sections (highest confirm rate)
- `calendly_web_mobbin_flows.xlsx` — 68 flows, 12 sections
- `docusign_ios_mobbin_flows.xlsx` — 36 flows, 7 sections
- `docusign_web_mobbin_screens.xlsx` — 92 flows, 11 sections
- `linear_ios_mobbin_flows.xlsx` — 37 flows, 136 screens, 9 sections
- `linear_web_mobbin_flows.xlsx` — 44 flows, 234 screens, 12 sections
- `notion_ios_mobbin_flows.xlsx` — 37 flows, 182 screens, 9 sections (10 confirmed)
- `notion_web_mobbin_flows.xlsx` — 42 flows, 251 screens, 9 sections (8 confirmed)
- `pandadoc_web_mobbin_flows.xlsx` — 38 flows, 192 screens, 10 sections

---

## 4. Core Design Principles

### Principle 1: Speed-First (from Linear)
Every interaction <100ms. Keyboard shortcuts for power users. Command palette (Cmd+K) as universal entry point. Optimistic UI updates. Linear's 81 flows (37 iOS + 44 Web) analyzed for speed patterns including sub-100ms issue creation, command palette navigation, and keyboard-first workflows.

### Principle 2: Block-Based Flexibility (from Notion)
Everything is a composable block. Pages, databases, documents, and projects share the same architecture. Drag-and-drop everything. 79 Notion flows analyzed including block editor, slash commands, wiki verification, synced blocks, AI writing.

### Principle 3: Data-Rich Views (from Airtable)
Multiple perspectives on the same data: Table, Board, Calendar, Timeline, Gallery, Form, Gantt. Every view is filterable, sortable, groupable, shareable. 118 Airtable flows analyzed across Grid, Kanban, Calendar, Gallery, Form views.

### Principle 4: One-Click Workflows (from Calendly)
Complex workflows reduced to single actions. Book a meeting in 3 clicks. Sign a document in 2 taps. 99 Calendly flows analyzed including smart booking, event types, availability, rescheduling, QR code sharing.

### Principle 5: Trust & Legal Compliance (from DocuSign)
Enterprise-grade security as a foundation. SOC 2, HIPAA, eIDAS, ESIGN, UETA compliance. Audit trails on everything. 128 DocuSign flows analyzed including envelope management, signing ceremony, identity verification, certificates.

### Principle 6: Beautiful Minimalism (from Linear + Notion)
Clean, distraction-free interfaces. Generous whitespace. Subtle animations. Dark mode as first-class citizen. Typography-driven hierarchy. Every pixel serves a purpose.

### Principle 7: AI-Native Intelligence (from Notion + PandaDoc)
AI embedded in every workflow: write, summarize, auto-fill, suggest schedules, predict completion, generate reports. Not a chatbot sidebar — AI woven into every interaction.

### Principle 8: Agent Teams & Deep Memory (SignOf Original)
Autonomous AI agent teams with 1,000,000 token context memory. Persist across sessions. Operate across modules. Learn organizational patterns. The architectural innovation that makes SignOf an intelligent partner, not just a tool.

---

## 5. Design System

### 5.1 Brand Identity

```
Logo:    "SignOf" in custom geometric sans-serif
         The "O" contains a subtle checkmark — the final sign-off
Tagline: "The Everything Platform"
Tone:    Confident · Clean · Trustworthy · Modern
```

### 5.2 Color Palette

#### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--signof-navy` | `#1A1A2E` | Primary backgrounds, headers, navigation |
| `--signof-coral` | `#E94560` | CTAs, alerts, destructive actions, badges |
| `--signof-blue` | `#0F3460` | Links, active states, information panels |
| `--signof-dark` | `#16213E` | Deep backgrounds, code blocks, modals |

#### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#00B894` | Signed, completed, active, online |
| `--warning` | `#FDCB6E` | Pending, attention needed, premium |
| `--error` | `#E17055` | Failed, overdue, validation errors |
| `--info` | `#74B9FF` | Informational, tips, guidance |

#### Surface Colors (Light / Dark Mode)
| Token | Light | Dark |
|-------|-------|------|
| `--surface-primary` | `#FFFFFF` | `#1A1A2E` |
| `--surface-secondary` | `#F8F9FA` | `#16213E` |
| `--surface-tertiary` | `#E9ECEF` | `#0F3460` |
| `--text-primary` | `#343A40` | `#F8F9FA` |
| `--text-secondary` | `#6C757D` | `#ADB5BD` |
| `--border-default` | `#DEE2E6` | `#2D3748` |

### 5.3 Typography

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| Display XL | Inter | 800 | 64px | 1.1 |
| Display | Inter | 700 | 48px | 1.15 |
| H1 | Inter | 700 | 32px | 1.25 |
| H2 | Inter | 600 | 24px | 1.3 |
| H3 | Inter | 600 | 20px | 1.35 |
| H4 | Inter | 500 | 16px | 1.4 |
| Body Large | Inter | 400 | 16px | 1.6 |
| Body | Inter | 400 | 14px | 1.6 |
| Caption | Inter | 500 | 12px | 1.4 |
| Overline | Inter | 600 | 11px | 1.4 |
| Code | JetBrains Mono | 400 | 13px | 1.5 |

### 5.4 Spacing (8px Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight inline |
| `--space-2` | 8px | Icon gaps, compact lists |
| `--space-3` | 12px | Form field gaps |
| `--space-4` | 16px | Card padding |
| `--space-5` | 24px | Group spacing |
| `--space-6` | 32px | Section spacing |
| `--space-8` | 48px | Page section gaps |
| `--space-10` | 64px | Major dividers |

### 5.5 Elevation

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 | none | Flat elements |
| 1 | `0 1px 3px rgba(0,0,0,0.08)` | Cards, inputs |
| 2 | `0 4px 12px rgba(0,0,0,0.10)` | Dropdowns, popovers |
| 3 | `0 8px 24px rgba(0,0,0,0.12)` | Modals, command palette |
| 4 | `0 16px 48px rgba(0,0,0,0.16)` | Full-screen overlays |

### 5.6 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, tags |
| `--radius-md` | 8px | Buttons, cards |
| `--radius-lg` | 12px | Modals, panels |
| `--radius-xl` | 16px | Feature panels |
| `--radius-full` | 9999px | Avatars, pills |

### 5.7 Motion

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 100ms | ease-out | Hover, toggles |
| Fast | 150ms | ease-in-out | Dropdowns, tooltips |
| Normal | 200ms | ease-in-out | Modals, transitions |
| Smooth | 300ms | cubic-bezier(0.4,0,0.2,1) | Sidebar expand |
| Slow | 500ms | cubic-bezier(0.4,0,0.2,1) | Full page transitions |

### 5.8 Iconography

- Primary: Lucide Icons (24px grid, 1.5px stroke)
- Custom: SignOf module icons
- Sizes: 16px (inline), 20px (nav), 24px (primary), 32px (featured), 48px (empty states)

---

## 6. Platform Architecture

### 6.1 Navigation Structure (Web)

```
┌─────────────────────────────────────────────────────────────┐
│  SignOf✓   Workspace Name    [🔍 Search / Cmd+K]   👤  ☰  │
├──────────┬──────────────────────────────────────────────────┤
│ SIDEBAR  │                 MAIN CONTENT                     │
│          │                                                  │
│ 🏠 Home  │  Renders based on active module:                │
│ 📝 Pages │  • Page editor (Module 01)                      │
│ 📋 Projects│ • Issue board/list (Module 02)                 │
│ 📄 Docs  │  • Document builder (Module 03)                 │
│ 📅 Calendar│ • Calendar view (Module 04)                    │
│ 🗃️ Data   │  • Database grid (Module 05)                    │
│ 📥 Inbox │  • Notification feed (Module 06)                │
│ ──────── │                                                  │
│ Teams    │  ┌──────────────────────────────────────────┐   │
│ Favorites│  │         DETAIL PANEL (optional)          │   │
│ ──────── │  │   Comments · Activity · Properties       │   │
│ ⚙️ Settings│ └──────────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────────────┘
```

**Sources:** Notion (collapsible page tree), Linear (team sidebar), Asana (favorites)

### 6.2 Command Palette (Cmd+K)

**Source:** Linear's command palette — the most praised UI pattern in modern SaaS

```
┌──────────────────────────────────────────────────┐
│ 🔍 Type a command or search...                    │
├──────────────────────────────────────────────────┤
│ RECENT                                            │
│  📄 Q1 Sales Proposal              3m ago         │
│  📋 Sprint 24 Board                1h ago         │
│  📅 Team Standup                   Today 9am      │
├──────────────────────────────────────────────────┤
│ QUICK ACTIONS                                     │
│  ➕ Create new page              Cmd+N            │
│  📋 Create new issue             Cmd+I            │
│  📄 Create new document          Cmd+D            │
│  📅 Schedule meeting             Cmd+M            │
│  ✍️ Request signature             Cmd+Shift+S     │
│  🤖 Start agent team             Cmd+Shift+A     │
├──────────────────────────────────────────────────┤
│ AI                                                │
│  🧠 "Summarize project X"                        │
│  🧠 "Draft proposal for client Y"                │
│  🧠 "What's overdue this week?"                  │
└──────────────────────────────────────────────────┘
```

**Capabilities:**
- Fuzzy search across all content types
- Direct actions: "Create issue", "Sign document", "Schedule with [person]"
- AI commands: "Summarize [project]", "Draft [doc type]", "Find overdue tasks"
- <50ms keystroke-to-result response time

---

## 7. Module 01: Smart Workspace & Knowledge Hub

> **Design DNA:** Notion (79 flows) + Airtable (118 flows) + Linear (sidebar)
> **Innovation:** Block editor that handles docs, databases, projects, AND e-signatures in one surface

### 7.1 Block-Based Page Editor

**Source:** Notion — Onboarding (31 screens Web confirmed), Adding code block (11 screens), Adding callout (4 screens), Adding properties (3 screens)

The page editor is SignOf's atomic unit. Every page is a canvas of composable blocks. Unlike Notion (which needs separate tools for signing/projects), SignOf's editor natively supports signature blocks, task blocks, scheduling blocks, and database blocks alongside text.

**Block Types (60+):**

| Category | Blocks | Source |
|----------|--------|--------|
| Text | Paragraph, H1-H3, Quote, Callout, Toggle, Divider | Notion |
| Rich Media | Image, Video, Audio, File, Bookmark, Embed | Notion |
| Code | Code block (50+ languages), Math (KaTeX) | Notion |
| Data | Inline Table, Full Database, Chart, Timeline | Airtable + Notion |
| Collaboration | Comment thread, Mention, Reminder | Notion + Asana |
| Documents | Signature block, PDF viewer, Pricing table | DocuSign + PandaDoc |
| Scheduling | Calendar embed, Booking widget, Availability | Calendly |
| Project | Task/Issue block, Progress bar, Status tracker | Linear + Asana |
| AI | AI summary, AI draft, AI translation, AI Q&A | Notion AI |
| Layout | Columns (2-5), Tabs, Accordion, Card grid | Notion |
| Advanced | Synced block, Template button, TOC | Notion |

**Slash Commands:** `/` → all blocks. `/h` → headings. `/sign` → signature. `/book` → booking. `/ai` → AI tools.

**Inline Commands:** `@` mention, `[[` page link, `++` create task, `!!` reminder, `$$` math equation.

### 7.2 Wiki System with Verification

**Source:** Notion — Turning page into wiki (5 screens iOS confirmed, 11 screens Web confirmed)

- Owner assignment with verification badge ("Verified by [Name] on [Date]")
- Staleness detection: auto-flag unreviewed pages (30/60/90 day configurable)
- Verification prompts: periodic "Is this still accurate?" nudges
- Sub-page organization with structured wiki tree
- Search priority: verified pages rank higher

### 7.3 Templates Gallery

**Source:** Notion + Airtable + PandaDoc (combined 1,000+ templates)

- 2,000+ pre-built templates by category: Engineering, Sales, Marketing, HR, Legal, Product, Design, Finance
- Per-module templates: workspace pages, project boards, document contracts, event types, database schemas
- Custom templates: save any page/project/document as team template
- Template variables: `{{company_name}}`, `{{date}}`, `{{client_name}}` auto-fill from CRM
- Community marketplace for sharing templates

### 7.4 AI Writing & Q&A

**Source:** Notion AI — Rating AI answer (3 screens Web confirmed)

AI accessible via: `/ai` slash command, text selection menu, page menu, Cmd+K → "Ask AI"

Capabilities: Write (draft, continue, expand, shorten), Edit (grammar, tone, simplify), Translate (50+ languages), Summarize (page/project/workspace), Q&A (workspace-wide with citations), Extract (action items, dates, decisions), Generate (tables, outlines, plans), Rate (thumbs up/down for quality improvement)

### 7.5 Synced Blocks & Content Library

**Source:** Notion (synced blocks) + PandaDoc (content library)

- Synced blocks: create once, embed anywhere, edit propagates everywhere
- Content library: reusable sections (legal disclaimers, bios, pricing, standard terms)
- Usage tracking: see where each library item is used
- Permissions: lock or open for team contributions
- Version control with rollback

---

## 8. Module 02: Project & Issue Tracking Engine

> **Design DNA:** Linear (81 flows, 7 confirmed) + Asana (137 flows, 13 confirmed)
> **Innovation:** Issue tracking at Linear speed with Asana versatility, connected to documents, databases, and scheduling

### 8.1 Lightning-Fast Issue Tracker

**Source:** Linear — Onboarding (8 screens iOS confirmed), Issue creation, Command palette

**Issue Properties:**
| Property | Type | Source |
|----------|------|--------|
| Title | Text (AI auto-suggest) | Linear |
| Status | Custom pipeline: Backlog → Todo → In Progress → In Review → Done | Linear |
| Priority | Urgent / High / Medium / Low / None | Linear |
| Assignee | Single person with avatar | Linear + Asana |
| Labels | Multi-select color-coded tags | Linear |
| Estimate | Story points or time | Linear |
| Cycle | Sprint/cycle assignment | Linear |
| Project | Parent initiative | Asana + Linear |
| Due date | Date or date range | Asana |
| Sub-issues | Nested children (unlimited depth) | Linear |
| Linked PRs | GitHub/GitLab links | Linear |
| Relations | Blocks / is-blocked-by / relates-to / duplicates | Linear |
| Attachments | Files, images, documents | Asana |

**Keyboard Shortcuts:**
```
C → Create issue    X → Select    L → Label    P → Priority
A → Assign          S → Status    Space → Preview panel
Cmd+K → Command palette    Shift+Enter → Create & open
```

**Issue Detail View:**
```
┌──────────────────────────────────────────────────┐
│ ◀ PROJ-142: Redesign checkout flow               │
│ Status: [🔵 In Progress] Priority: [🟠 High]    │
│ Assignee: @Sarah   Cycle: Sprint 24   Due: Feb 15│
│ Labels: [design] [frontend]  Estimate: 5 pts     │
│──────────────────────────────────────────────────│
│ [Rich text description with block editor]         │
│──────────────────────────────────────────────────│
│ Sub-issues (3/5):                                │
│ ✅ Research competitors  ✅ Wireframes           │
│ ✅ Hi-fi mockups  🔵 Frontend  ⬜ QA            │
│──────────────────────────────────────────────────│
│ Linked Documents:                                │
│ 📄 Checkout Redesign PRD                        │
│ ✍️ Client Approval (awaiting signature)           │
│ 📅 Design Review Meeting (Feb 12)               │
│──────────────────────────────────────────────────│
│ Activity & Comments                              │
│ @Sarah: Updated status → In Progress  2h ago     │
│ [💬 Write a comment...]                         │
└──────────────────────────────────────────────────┘
```

### 8.2 Views

| View | Description | Source |
|------|-------------|--------|
| Board (Kanban) | Columns by status, drag-and-drop, swimlanes | Linear + Asana |
| List | Sortable table, inline editing, groupable | Linear + Asana |
| Timeline (Gantt) | Horizontal bars, dependencies, milestones | Asana |
| Calendar | Issues on calendar by due date | Asana |
| Table (Spreadsheet) | Airtable-style grid with formulas | Airtable |
| Dashboard | Custom charts, metrics, widgets | Asana |

### 8.3 Cycles (Sprints)

**Source:** Linear — Cycle management

- Configurable duration (1-4 weeks, custom)
- Auto-start with rollover of incomplete issues
- Burndown chart, velocity tracking, scope change monitoring
- AI-generated cycle review summary
- Historical comparison and trend analysis

### 8.4 Goals & OKRs

**Source:** Asana — Goals (confirmed in Web flows)

- Company → Team → Individual hierarchy
- Key Results with measurable targets and auto-progress from linked projects
- Alignment visualization: individual work → company objectives
- AI-generated quarterly progress summaries
- Status: On track / At risk / Off track (automated detection)

### 8.5 Portfolios & Roadmap

**Source:** Asana (Portfolios) + Linear (Initiatives & Roadmap)

- Multi-project dashboard with health indicators
- Visual roadmap across quarters
- Resource workload and capacity planning
- AI-drafted weekly status updates
- Cross-project dependency mapping

### 8.6 Triage & Smart Inbox

**Source:** Linear — Triage, Inbox, Notifications

- Unified inbox across ALL modules (projects, docs, calendar, databases)
- J/K navigation, E to archive, S to snooze
- AI daily/weekly digest of what matters most
- Smart grouping by project, person, type
- Bulk actions: select multiple → archive / assign / label

---

## 9. Module 03: Document Automation & E-Signature Suite

> **Design DNA:** DocuSign (128 flows) + PandaDoc (38 flows, 3 confirmed)
> **Innovation:** Document creation → signing → payment in one seamless flow — never leave the platform

### 9.1 Drag-and-Drop Document Builder

**Source:** PandaDoc — Document editor (confirmed: sidebar for content blocks and fillable fields) + DocuSign (document preparation)

Extends SignOf's block editor with document-specific blocks:

| Block | Description | Source |
|-------|-------------|--------|
| Signature Field | Draw, type, or upload | DocuSign |
| Initial Field | Initials capture | DocuSign |
| Date Signed | Auto-populated date | DocuSign |
| Text Input | Fillable text for recipients | DocuSign + PandaDoc |
| Checkbox | Single/multi-select | DocuSign |
| Dropdown | Predefined options | DocuSign |
| Pricing Table | Catalog, line items, tax, total | PandaDoc |
| Payment Block | Stripe/PayPal/ACH | PandaDoc |
| Content Library | Reusable sections | PandaDoc |
| Variable/Token | Auto-fill from CRM | PandaDoc |

**Builder UI:**
```
┌──────────┬───────────────────────────────────────────┐
│ SIDEBAR  │         DOCUMENT CANVAS                    │
│          │                                            │
│ Content  │  [Drag blocks from sidebar onto canvas]    │
│ ├ Text   │                                            │
│ ├ Image  │  ┌────────────────────────────┐           │
│ ├ Table  │  │ Signature: ____________    │           │
│          │  │ Date: _______________       │           │
│ Fields   │  │ Name: _______________       │           │
│ ├ Sign   │  └────────────────────────────┘           │
│ ├ Initial│                                            │
│ ├ Date   │  RECIPIENTS                                │
│ ├ Check  │  👤 Client (signer) → 3 fields            │
│          │  👤 Manager (approver) → 1 field           │
│ Pricing  │                                            │
│ ├ Table  │  [Preview] [Save Template] [Send ▶]       │
│ ├ Payment│                                            │
└──────────┴───────────────────────────────────────────┘
```

### 9.2 Legally-Binding E-Signatures

**Source:** DocuSign — Signing ceremony, Identity verification (92 Web flows)

**Signing Flow:**
1. Email/SMS notification with secure link
2. Identity verification (email, SMS code, access code, ID upload, biometric)
3. Document review with guided field navigation ("Next field")
4. Signature capture: draw / type / upload
5. Review all fields and confirm
6. Legal consent + "Finish"
7. Certificate of completion auto-generated

**Compliance:** ESIGN, UETA, eIDAS, ZertES, SOC 2, HIPAA, tamper-evident seals, full audit trail

**Signing Order:** Sequential, Parallel, Hybrid, Conditional (if amount > $50K → add VP approval)

### 9.3 Envelope Management

**Source:** DocuSign — Full envelope lifecycle

**States:** `Draft → Sent → Delivered → Viewed → Signed → Completed` (with Declined / Voided branches)

Dashboard with tabs: All | Action Required | Waiting | Completed | Draft

### 9.4 Pricing Tables & CPQ

**Source:** PandaDoc — Product catalog, auto-calculations

- Product catalog with SKUs, descriptions, pricing
- Line items: product, qty, unit price, discount, tax, total
- Auto-calculations with currency support (100+ currencies)
- Approval triggers: auto-route if discount > threshold

### 9.5 Payment Collection

**Source:** PandaDoc — Sign-and-pay flow

- Stripe, PayPal, ACH, wire transfer
- Collect on signature, on date, or recurring
- Partial payments and payment plans
- Auto receipts and invoicing

### 9.6 Document Analytics & Audit Trail

**Source:** PandaDoc (analytics) + DocuSign (audit trail)

- Real-time: opens, pages viewed, time per page
- Engagement heatmap
- Complete audit trail: every action timestamped with IP/device
- Certificate of completion with cryptographic hash
- Compliance reporting exports

---

## 10. Module 04: Scheduling & Calendar Intelligence

> **Design DNA:** Calendly (99 flows, 31 confirmed)
> **Innovation:** Scheduling natively integrated — meetings auto-create tasks, attach docs, trigger signing workflows

### 10.1 Event Type Builder

**Source:** Calendly — Event Types (confirmed: 2 screens), Updating Working Hours (6 screens), Adding Date Override (8 screens)

| Type | Description |
|------|-------------|
| One-on-One | Standard 1:1 meeting |
| Group | Multiple invitees, single host |
| Round Robin | Auto-distribute across team |
| Collective | Requires all team members |
| Secret | Hidden, share via link only |
| Signing Session | Meeting + document signing combined (SignOf original) |
| Project Kickoff | Auto-creates project, tasks, docs (SignOf original) |

**Configuration:** Duration, buffer time, daily limits, minimum notice, date range, custom questions, auto-attach documents for signing

### 10.2 Smart Booking Page

**Source:** Calendly — Scheduling (confirmed: 16 screens Onboarding, 11 Scheduling, 13 Rescheduling)

**Flow:** Select event → Choose date → Pick time → Enter details → Confirm → Calendar invite sent

- Timezone auto-detection with manual override
- Real-time availability (no double-booking)
- Custom branding (logo, colors, background)
- Mobile-optimized with bottom sheet date picker

### 10.3 Availability Management

**Source:** Calendly — Availability (confirmed: Working Hours 6 screens, Date Override 8 screens)

- Weekly recurring schedule per day
- Calendar connections: Google, Outlook, iCloud, CalDAV
- Conflict detection across all calendars
- Date overrides for holidays/special hours
- Focus time blocks

### 10.4 Rescheduling & Cancellation

**Source:** Calendly — Rescheduling (13 screens confirmed), Canceling (5 screens confirmed)

- Self-service reschedule from email (one-click)
- Cancellation with reason collection
- Policy enforcement (minimum notice)
- No-show tracking with auto follow-up

### 10.5 Workflows & Automations

**Source:** Calendly — Pre/post-event workflows

- Pre-meeting reminders (email/SMS)
- Post-meeting follow-ups and surveys
- On booking: add to CRM, create task, notify Slack
- SignOf-native: "After meeting → send contract → collect payment"

---

## 11. Module 05: Relational Database & Workflow Engine

> **Design DNA:** Airtable (118 flows, 3 confirmed) + Notion (database views)
> **Innovation:** Databases containing documents with e-signatures, tasks, and events as linked records

### 11.1 Multi-View Databases

**Source:** Airtable — All view types (59 iOS + 59 Web flows)

| View | Best For |
|------|----------|
| Grid | Data entry, bulk operations |
| Kanban | Pipeline tracking, status workflows |
| Calendar | Date-based records |
| Timeline | Project planning, resource scheduling |
| Gallery | Contact cards, product catalogs |
| Form | Lead capture, surveys, requests |
| List | Quick scanning, triage |
| Chart | Bar, line, pie, scatter analytics |
| Gantt | Dependencies, critical path |

### 11.2 Field Types (30+)

| Category | Types |
|----------|-------|
| Text | Single line, Long text, Rich text, URL, Email, Phone |
| Number | Number, Currency, Percentage, Rating, Duration |
| Select | Single select, Multi-select |
| Date | Date, Date+time, Created time, Modified time |
| Person | User, Collaborator, Created by, Modified by |
| Relation | Link to table, Lookup, Rollup, Count |
| Boolean | Checkbox |
| Computed | Formula, Auto-number, Button |
| Media | Attachment (files, images, docs) |
| SignOf-Native | Signature status, Document link, Meeting link, Task status |

### 11.3 Automations

**Source:** Airtable — Automation builder

**Triggers:** Record matches conditions, Record created/updated/deleted, Form submitted, Document signed, Meeting booked, Task status changed, Scheduled time, Webhook received

**Actions:** Create/update/delete records, Send notification, Create document from template, Send for signature, Create project/task, Schedule meeting, Call API, Run script, AI (summarize, categorize, extract, generate)

### 11.4 Interface Designer

**Source:** Airtable — Interface designer

- Drag-and-drop layout builder
- Components: tables, charts, forms, buttons, text, images, number cards, filters
- Data source: any database or computed metric
- Permissions control, embeddable via link
- Mobile-responsive auto-layout

---

## 12. Module 06: Universal Settings & Administration

> **Design DNA:** All 7 platforms

### 12.1 Settings Structure

```
⚙️ Settings
├── General (name, URL, logo, branding, timezone, language)
├── Members & Teams (invite, roles, team management, guest policies)
├── Security (SSO/SAML, 2FA, sessions, IP allowlist, encryption)
├── Billing & Plans (plan, payment, invoices, upgrade)
├── Integrations (200+ apps, API keys, webhooks)
├── Import & Export (competitor import, data export, backup)
└── Appearance (theme, accent color, density, font size, sidebar)
```

### 12.2 Role Matrix

| Capability | Owner | Admin | Member | Guest | Viewer |
|-----------|-------|-------|--------|-------|--------|
| Manage billing | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create content | ✅ | ✅ | ✅ | Limited | ❌ |
| View content | ✅ | ✅ | ✅ | ✅ | ✅ |
| Send for signature | ✅ | ✅ | ✅ | ❌ | ❌ |
| Sign documents | ✅ | ✅ | ✅ | ✅ | ❌ |
| Configure integrations | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete workspace | ✅ | ❌ | ❌ | ❌ | ❌ |

### 12.3 Integrations Hub (200+)

| Category | Apps |
|----------|------|
| Communication | Slack, Teams, Discord |
| Developer | GitHub, GitLab, Bitbucket, Sentry |
| CRM | Salesforce, HubSpot, Pipedrive |
| Design | Figma, Sketch, Adobe XD |
| Storage | Google Drive, Dropbox, Box, OneDrive |
| Video | Zoom, Google Meet, Teams, Loom |
| Payment | Stripe, PayPal, Square |
| Automation | Zapier, Make.com, n8n |
| AI | OpenAI, Anthropic Claude, Google Gemini |

---

## 13. Module 07: Onboarding & Authentication

> **Design DNA:** All 7 platforms — 80+ onboarding flows synthesized
> **Innovation:** <2 minute time-to-value with AI-personalized setup

### 13.1 Authentication Methods

1. Email + password (strength meter)
2. Magic link (passwordless)
3. Google / Microsoft / Apple OAuth
4. SAML SSO (enterprise)
5. Passkey / biometric (WebAuthn)

**Login UI:**
```
┌──────────────────────────────────────┐
│           SignOf✓                     │
│                                      │
│   Welcome back. Sign in to continue. │
│                                      │
│   [📧 your@email.com              ] │
│   [    Continue with Email    →    ] │
│                                      │
│   ─── or ───                         │
│                                      │
│   [🔵 Continue with Google         ] │
│   [⬛ Continue with Microsoft      ] │
│   [ Continue with Apple           ] │
│   [🔑 Continue with Passkey        ] │
│                                      │
│   Don't have an account? Sign up →   │
└──────────────────────────────────────┘
```

### 13.2 Progressive Onboarding (8 Steps, <2 min)

**Source:** Notion (31 screens Web confirmed), Calendly (16 screens iOS), Linear (8 screens iOS)

1. Create account (email or SSO)
2. Name + avatar
3. Workspace name + URL
4. Use case: [Projects] [Documents] [Knowledge] [Scheduling] [Databases] [Everything]
5. Role: [Engineering] [Sales] [Marketing] [HR] [Design] [Product] [Ops] [Executive]
6. Invite team (email, link, or skip)
7. AI auto-generates workspace template, first project, sample doc, booking page
8. Interactive tour: [Try editor] [Create issue] [Send document] [Share booking link]

### 13.3 Getting Started Checklist

**Source:** Airtable + Asana

```
🚀 Getting Started with SignOf        3/7 done
━━━━━━━━━━━━━━━░░░░░░░░░░  43%
✅ Create your workspace
✅ Write your first page
✅ Create a project
⬜ Send a document for signature
⬜ Share your booking page
⬜ Connect an integration
⬜ Invite a team member
```

---

## 14. Module 08: AI Command Center

> **Design DNA:** Notion AI + SignOf Original
> **Innovation:** First AI Agent Teams system with 1,000,000 token organizational memory

### 14.1 AI Modes

| Mode | Trigger | Capability |
|------|---------|------------|
| Inline AI | `/ai` or select text | Write, edit, translate, summarize within any block |
| Page AI | Page menu → "AI" | Summarize page, extract tasks, generate outline |
| Workspace AI | Cmd+K → "Ask AI" | Q&A across all workspace content with citations |
| Document AI | In doc builder | Auto-fill templates, suggest clauses, review errors |
| Project AI | In project view | Predict completion, identify blockers, status update |
| Schedule AI | In calendar | Suggest optimal times, auto-schedule, find conflicts |
| Agent Teams | Cmd+Shift+A | Multi-step autonomous workflows (see §15) |

### 14.2 AI Capabilities

| Capability | Modules | Description |
|-----------|---------|-------------|
| Smart Compose | Workspace, Docs | AI writing with tone/length/style control |
| Auto-Summarize | All | One-click summaries of any content |
| Task Extraction | Workspace, Projects | Action items from notes, emails, docs |
| Template Auto-Fill | Documents | Populate from CRM, contacts, project data |
| Contract Review | Documents | Flag unusual clauses, missing sections |
| Priority Suggestions | Projects | AI-recommended priority based on context |
| Schedule Optimizer | Calendar | Optimal meeting times considering preferences |
| Workspace Q&A | All | Natural language questions with citations |
| Translation | All | 50+ languages with context awareness |
| Data Analysis | Databases | Natural language queries with chart generation |
| Trend Prediction | Projects, Data | Velocity prediction, anomaly detection |

---

## 15. Agent Teams & 1M Context Memory

> **This is SignOf's architectural moat — the feature that makes $1T defensible**

### 15.1 What Are Agent Teams?

Agent Teams are autonomous AI agents assigned complex, multi-step tasks spanning all SignOf modules. Unlike single-prompt AI:

- **Persist across sessions** — remember context and progress
- **Operate across modules** — create doc, populate from DB, send for signature, schedule meeting, create project task — all in one flow
- **Collaborate with each other** — parallel agents on different workflow aspects
- **Learn from patterns** — improve via 1M context memory

### 15.2 Agent Architecture

```
┌─────────────────────────────────────────────────────────┐
│               AGENT TEAM ORCHESTRATOR                    │
│      (Routes tasks, manages context, ensures quality)    │
├─────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │ Research │ │ Writing  │ │ Project  │ │ Signing  │   │
│ │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │   │
│ │ Search   │ │ Draft    │ │ Create   │ │ Prepare  │   │
│ │ Analyze  │ │ Edit     │ │ Assign   │ │ Route    │   │
│ │ Compare  │ │ Translate│ │ Track    │ │ Send     │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │ Schedule │ │ Database │ │ Analytics│ │ Custom   │   │
│ │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │   │
│ │ Find time│ │ Query    │ │ Metrics  │ │ User-    │   │
│ │ Book     │ │ Update   │ │ Charts   │ │ defined  │   │
│ │ Remind   │ │ Import   │ │ Predict  │ │ logic    │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│           1,000,000 TOKEN CONTEXT MEMORY                │
│   (Persistent organizational knowledge across sessions)  │
└─────────────────────────────────────────────────────────┘
```

### 15.3 Agent Team Use Cases

**Use Case 1: End-to-End Sales Deal**
```
Prompt: "Close the Acme Corp deal"

1. Research Agent → Pull CRM data, review past communications
2. Writing Agent → Draft customized proposal from template
3. Database Agent → Insert pricing, apply negotiated discount
4. Signing Agent → Prepare envelope with correct signers
5. Schedule Agent → Book signing meeting with stakeholders
6. Project Agent → Create "Acme Onboarding" project with tasks
7. Analytics Agent → Log in pipeline, update forecast
```

**Use Case 2: New Employee Onboarding**
```
Prompt: "Onboard Sarah Chen as Senior Engineer starting March 1"

1. Writing Agent → Generate offer letter from HR template
2. Signing Agent → Send offer letter + NDA + IP agreement
3. Project Agent → Create 30-day onboarding checklist
4. Schedule Agent → Book orientation with team lead, HR, IT
5. Database Agent → Create employee record in HR database
6. Research Agent → Prepare role-specific wiki links
```

**Use Case 3: Quarterly Business Review**
```
Prompt: "Prepare Q1 QBR for the board"

1. Analytics Agent → Pull Q1 metrics from all databases
2. Research Agent → Compare against Q4 and industry benchmarks
3. Writing Agent → Draft executive summary and highlights
4. Database Agent → Generate revenue tables and pipeline data
5. Writing Agent → Create presentation outline
6. Schedule Agent → Book QBR with board, send calendar hold
```

### 15.4 The 1,000,000 Token Context Memory

**What it stores:**
- Organizational structure: teams, roles, reporting lines
- Workflow patterns: "When we close a deal, we always do X then Y then Z"
- Style preferences: "Our proposals use formal tone with metric-first language"
- Domain knowledge: industry terminology, client histories, product details
- Decision history: past decisions, rationale, outcomes
- Template evolution: how templates have been customized over time
- User preferences: individual working styles, communication habits

**How it learns:**
1. **Explicit:** users tell agents "Remember that we always include 30-day terms for enterprise"
2. **Observation:** learns from repeated actions ("Sarah always adds scope before pricing")
3. **Feedback:** thumbs up/down refines future behavior
4. **Cross-workspace:** (opt-in) aggregate patterns from similar orgs

**Memory Architecture:**
```
1,000,000 Token Context Window
├── Persistent Memory (never expires)
│   ├── Org structure & teams (~50K tokens)
│   ├── Core workflows & processes (~100K tokens)
│   ├── Style guides & preferences (~50K tokens)
│   └── Domain knowledge (~100K tokens)
├── Session Memory (current task)
│   ├── Current task context (~200K tokens)
│   ├── Referenced docs & data (~300K tokens)
│   └── Agent state & progress (~100K tokens)
└── Recall Memory (on demand)
    ├── Historical decisions (~50K tokens)
    └── Similar past tasks (~50K tokens)
```

**Privacy:** Workspace-scoped (never shared), viewable/editable/deletable by users, admin controls, AES-256 encrypted, SOC 2 compliant, GDPR "right to be forgotten" supported.

### 15.5 Agent Team UI

```
┌──────────────────────────────────────────────────────┐
│ 🤖 Agent Team: Close Acme Corp Deal      [Running]  │
├──────────────────────────────────────────────────────┤
│ PROGRESS                              4/7 steps      │
│ ━━━━━━━━━━━━━━━━━━━━━░░░░░░░░  57%                 │
│                                                      │
│ ✅ Step 1: Research Agent pulled Acme data           │
│    → 3 proposals, 12 email threads found             │
│ ✅ Step 2: Writing Agent drafted proposal            │
│    → 📄 "Acme Service Agreement v1"                 │
│ ✅ Step 3: Database Agent inserted pricing           │
│    → Applied 15% enterprise discount                 │
│ 🔵 Step 4: Signing Agent preparing envelope...      │
│    → Adding 3 signers: CEO, CFO, Legal               │
│ ⬜ Step 5: Schedule Agent (queued)                   │
│ ⬜ Step 6: Project Agent (queued)                    │
│ ⬜ Step 7: Analytics Agent (queued)                  │
│                                                      │
│ [Pause] [Edit Steps] [Cancel]          [Chat 💬]    │
│ 💬 "Change the discount to 20%"                     │
│ 🤖 "Updated. Total: $48K → $45K."                  │
└──────────────────────────────────────────────────────┘
```

---

## 16. Mobile Experience (iOS & Android)

> **Source:** 263 iOS flows from all 6 mobile platforms

### 16.1 Mobile Navigation

**Bottom Tab Bar (from Asana iOS + Calendly iOS):**
```
| 🏠 Home | 📋 Projects | 📄 Docs | 📅 Cal | 📥 Inbox |
```

### 16.2 Mobile Design Patterns

| Pattern | Source |
|---------|--------|
| Bottom Sheet Modal | Calendly iOS (25+ flows) |
| Swipe Actions (archive/snooze) | Linear iOS |
| Pull-to-Refresh | All iOS apps |
| Long Press Menu | Notion iOS |
| Floating Action Button (+) | Airtable iOS |
| Haptic Feedback | DocuSign iOS (signing) |
| Inline Editing | Asana iOS |
| Offline Mode | Notion iOS |

### 16.3 Mobile-Specific Features

- Quick Capture: shake to capture idea/task/note
- Widgets: today's meetings, open tasks, pending signatures
- Apple Watch / Wear OS: reminders, task completion, sig notifications
- Biometric login: Face ID / Touch ID / fingerprint
- Camera: scan documents, OCR, whiteboard capture
- Voice commands: Siri / Google Assistant integration
- Push notifications: granular per-module controls

---

## 17. Cross-Platform Feature Mapping

| Source | Feature | SignOf Module | Enhancement |
|--------|---------|---------------|-------------|
| Airtable | Relational databases | Module 05 | Integrated with docs, projects & signing |
| Airtable | Grid/Kanban/Calendar/Gallery views | Module 05 | 9 view types on any data |
| Airtable | Automations & formulas | Module 05 | AI-powered + 200 integrations |
| Airtable | Interface designer | Module 05 | Connected to all modules |
| Airtable | Forms | Module 05 | Auto-trigger cross-module workflows |
| Asana | Task management | Module 02 | Linear speed + Asana versatility |
| Asana | Goals & OKRs | Module 02 | AI alignment analysis |
| Asana | Portfolios & workload | Module 02 | Cross-module resource visibility |
| Asana | Timeline (Gantt) | Module 02 | Dependencies + doc milestones |
| Asana | My Tasks & Inbox | Module 02 | Unified inbox across all modules |
| Calendly | Event type builder | Module 04 | Signing sessions, project kickoffs |
| Calendly | Booking page | Module 04 | Embedded in workspace, branded |
| Calendly | Availability management | Module 04 | AI-optimized scheduling |
| Calendly | Rescheduling/cancellation | Module 04 | Self-service + policy enforcement |
| Calendly | Workflows | Module 04 | Post-meeting → contract → payment |
| DocuSign | E-signature capture | Module 03 | One-click in any doc type |
| DocuSign | Envelope management | Module 03 | Merged with analytics |
| DocuSign | Identity verification | Module 03 | SMS, email, ID + biometric |
| DocuSign | Audit trail & certificates | Module 03 | Cross-module compliance |
| DocuSign | Bulk send | Module 03 | Database-powered mass signing |
| Linear | Issue tracking | Module 02 | <100ms with document linking |
| Linear | Command palette (Cmd+K) | All Modules | Universal across platform |
| Linear | Cycles (sprints) | Module 02 | AI-generated cycle reviews |
| Linear | Dark mode | All Modules | First-class everywhere |
| Linear | Insights & analytics | Module 02 | Cross-module AI analytics |
| Notion | Block-based editor | Module 01 | Extended: signing + pricing blocks |
| Notion | Wiki & verification | Module 01 | AI staleness detection |
| Notion | Templates | Module 01 | 2,000+ across all modules |
| Notion | AI writing & Q&A | Module 08 | Agent Teams + 1M memory |
| Notion | Synced blocks | Module 01 | Cross-module content syncing |
| PandaDoc | Doc builder | Module 03 | Unified with Notion editor |
| PandaDoc | Pricing tables & CPQ | Module 03 | Connected to catalog + CRM |
| PandaDoc | Payment collection | Module 03 | Sign + pay in one flow |
| PandaDoc | Document analytics | Module 03 | Real-time + AI insights |
| PandaDoc | Content library | Module 01 | Shared across docs + pages |

---

## 18. Component Library (47 Components)

| # | Component | Variants | Usage |
|---|-----------|----------|-------|
| 1 | Button | Primary, Secondary, Ghost, Danger, Icon | Actions |
| 2 | Input | Text, Email, Password, Number, Search, Textarea | Forms |
| 3 | Select | Single, Multi, Searchable, Creatable | Dropdowns |
| 4 | Checkbox | Standard, Indeterminate, Toggle | Forms |
| 5 | Radio | Standard, Button group, Card select | Options |
| 6 | Avatar | User, Team, Placeholder, Status | Identity |
| 7 | Badge | Status, Count, Dot, Label | Metadata |
| 8 | Toast | Success, Error, Warning, Info, Action | Notifications |
| 9 | Modal | Standard, Full-screen, Side panel, Confirm | Dialogs |
| 10 | Popover | Dropdown, Tooltip, Context menu | Context |
| 11 | Card | Standard, Interactive, Kanban, Feature | Containers |
| 12 | Table | Standard, Compact, Striped, Sortable | Data |
| 13 | Tabs | Standard, Pill, Underline, Vertical | Navigation |
| 14 | Sidebar | Collapsible, Tree, Fixed, Overlay | Navigation |
| 15 | Command Palette | Search, Actions, Navigation, AI | Universal |
| 16 | Calendar | Month, Week, Day, Mini, Date picker | Scheduling |
| 17 | Chart | Bar, Line, Pie, Donut, Area, Scatter | Viz |
| 18 | Progress | Bar, Circular, Steps, Checklist | Status |
| 19 | Signature Pad | Draw, Type, Upload, Initials | E-sign |
| 20 | Rich Text Editor | Toolbar, Slash, Floating bar | Editing |
| 21 | File Upload | Drag-and-drop, Browse, Multi | Files |
| 22 | Kanban Board | Columns, Cards, DnD, Swimlanes | Projects |
| 23 | Timeline | Bars, Dependencies, Milestones | Planning |
| 24 | Form Builder | Field palette, DnD, Preview | Forms |
| 25 | Filter Bar | Compound, Save/Share, Quick | Filtering |
| 26 | Breadcrumb | Standard, Truncated, Dropdown | Nav |
| 27 | Pagination | Numbered, Load more, Infinite | Lists |
| 28 | Skeleton | Content, Card, Table, List | Loading |
| 29 | Empty State | Illustration, CTA, Suggestions | Zero-data |
| 30 | Error State | 404, 500, Offline, Permission | Errors |
| 31 | Keyboard Shortcut | Single, Combo, Tooltip | Power users |
| 32 | Notification Center | List, Grouped, Actions | Alerts |
| 33 | User Menu | Profile, Settings, Theme, Logout | Account |
| 34 | Team Switcher | List, Search, Create | Workspace |
| 35 | Color Picker | Swatches, Custom, Hex | Custom |
| 36 | Date Range Picker | Presets, Custom, Relative | Filtering |
| 37 | Mention | User, Page, Date, AI | References |
| 38 | Drag Handle | 6-dot grip | Reordering |
| 39 | Status Indicator | Online, Away, Busy, Offline | Presence |
| 40 | Pricing Table | Line items, Totals, Tax | Docs |
| 41 | Payment Widget | Card, PayPal, ACH | Payments |
| 42 | QR Code | Static, Dynamic, Branded | Sharing |
| 43 | Code Block | Syntax, Copy, Line numbers | Code |
| 44 | Diff Viewer | Side-by-side, Inline | Versioning |
| 45 | Gantt Row | Bar, Deps, Milestones | Planning |
| 46 | Activity Feed | Timeline, Grouped, Filter | Collab |
| 47 | AI Response | Streaming, Citations, Actions | AI |

---

## 19. Interaction Design & Micro-Animations

| Interaction | Animation | Duration | Easing |
|------------|-----------|----------|--------|
| Button press | Scale 0.97, opacity 0.9 | 100ms | ease-out |
| Card hover | Y -2px, shadow up | 150ms | ease-in-out |
| Modal open | Scale 0.95→1, fade in | 200ms | cubic-bezier |
| Modal close | Scale 1→0.95, fade out | 150ms | ease-in |
| Sidebar toggle | Width animate, crossfade | 300ms | cubic-bezier |
| Drag start | Scale 1.02, shadow, opacity 0.9 | 100ms | ease-out |
| Drop | Scale 1.0, bounce, shadow reset | 200ms | spring |
| Toast enter | Slide right, fade in | 200ms | ease-out |
| Signature drawn | Ink trail w/ pressure | real-time | linear |
| Checkmark | Path draw + green pulse | 400ms | ease-in-out |
| Skeleton | Shimmer sweep L→R | 1500ms | linear loop |
| Command palette | Scale Y 0→1, blur bg | 150ms | cubic-bezier |

**Principles:** Purposeful (communicates meaning), Fast (<300ms), Smooth (60fps), Respectful (honors `prefers-reduced-motion`)

---

## 20. Accessibility & Internationalization

### WCAG 2.2 AA Compliance
- Full keyboard navigation with visible focus indicators
- Screen reader: ARIA labels, roles, live regions on all elements
- Color contrast: 4.5:1 body, 3:1 large text/UI
- `prefers-reduced-motion` respected
- Font scaling to 200%
- Focus management: logical order, trapping in modals, skip links
- Error messaging: color AND icon AND text

### i18n
- 40+ languages including RTL (Arabic, Hebrew)
- Locale-aware date/time, currency (100+), number formatting
- Full IANA timezone support with auto-detection
- AI-powered content translation (50+ languages)
- Full Unicode/emoji/CJK support

---

## 21. Performance & Technical Architecture

### Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | <1.0s |
| Largest Contentful Paint | <1.5s |
| Time to Interactive | <2.0s |
| Cumulative Layout Shift | <0.05 |
| First Input Delay | <50ms |
| Issue creation | <100ms |
| Search results | <50ms |
| Page navigation | <200ms |
| Document render | <500ms |
| Signature capture | <16ms (60fps) |

### Technical Stack

```
Frontend: Next.js 15 (React 19), Zustand, TanStack Query, Tailwind, Prosemirror, Yjs (CRDT)
Mobile: React Native (shared logic)
Desktop: Electron
Backend: GraphQL + REST, Node.js + Rust (hot paths), PostgreSQL + Redis + Elasticsearch
Storage: S3 + CDN (Cloudflare)
Real-time: WebSocket (horizontal scaling)
AI: Claude API (Anthropic) + custom fine-tuning
Infra: AWS/GCP multi-region, Kubernetes, Datadog monitoring
```

---

## 22. Security & Compliance

| Certification | Scope | Timeline |
|--------------|-------|----------|
| SOC 2 Type II | All modules | Launch |
| ISO 27001 | InfoSec | Year 1 |
| HIPAA | Docs, healthcare | Launch (BAA) |
| GDPR | EU data | Launch |
| CCPA | CA privacy | Launch |
| ESIGN/UETA | US e-signatures | Launch |
| eIDAS | EU e-signatures | Launch |
| FedRAMP | US gov | Year 2 |

**Security:** AES-256 at rest, TLS 1.3 in transit, zero-knowledge option, MFA (TOTP/SMS/FIDO2), SSO/SAML, IP allowlist, tamper-proof audit logs, data residency (US/EU/APAC), annual pen tests, HackerOne bug bounty

---

## 23. Growth & Monetization

### Pricing Tiers

| Plan | Price | Target | Key Features |
|------|-------|--------|-------------|
| **Free** | $0 | Individuals | 10 pages, 5 docs/mo, 1 event type, basic AI |
| **Pro** | $15/user/mo | Small teams | Unlimited pages & docs, 50 sigs/mo, advanced AI, 10 event types |
| **Business** | $30/user/mo | Mid-market | Unlimited everything, Agent Teams, 1M memory, SAML, priority support |
| **Enterprise** | Custom | Large orgs | Dedicated infra, custom compliance, SLA, dedicated CSM, data residency |

### Revenue Model

| Stream | Description |
|--------|-------------|
| Subscription | Per-seat monthly/annual |
| Signature volume | Per-signature pricing above tier limits |
| Payment processing | % of collected payments |
| API access | Usage-based API pricing |
| Agent Teams compute | Per-agent-task compute fees |
| Marketplace | Commission on community template sales |

### Growth Flywheel

```
Free Users → Create & Share → Invite Team → Convert to Pro
    ↓                                           ↓
Templates shared publicly ← Teams create templates
    ↓                                           ↓
New users discover SignOf ← Documents shared externally
    ↓                                           ↓
Platform gets smarter ← More data → Better AI → More value
```

---

## 24. Competitive Moat Analysis

### Why SignOf Wins

| Moat | Description |
|------|-------------|
| **Integration depth** | 7-tool replacement with native cross-module workflows impossible to replicate with integrations |
| **Data gravity** | All org knowledge, projects, documents, signatures in one place = astronomical switching costs |
| **Network effects** | Every user adds value: shared templates, scheduling pools, richer AI training data |
| **AI context monopoly** | Full-workflow context gives AI capabilities no single-tool competitor can match |
| **Agent Teams exclusivity** | Multi-module autonomous agents are architecturally impossible in single-purpose tools |
| **1M memory** | Organizational memory that improves with use — the more you use it, the better it gets |
| **Economic efficiency** | One bill replaces 7 = immediate CFO buy-in |

### Competitive Response Matrix

| Competitor | Can they replicate? | Barrier |
|-----------|-------------------|---------|
| Notion | Partial (add docs/sign) | No signing infrastructure, no scheduling |
| Asana | Partial (add docs) | No editor, no signing, no databases |
| DocuSign | Unlikely | No workspace, no projects, no scheduling |
| Calendly | Unlikely | No docs, no projects, no databases |
| Linear | Partial (add docs) | No signing, no scheduling, no databases |
| Airtable | Partial (add docs) | No signing, no scheduling, limited editor |
| PandaDoc | Unlikely | No projects, no scheduling, no databases |
| Microsoft | Possible but slow | Fragmented across 10+ products, poor UX |
| Google | Possible but slow | Same fragmentation issue |

---

## 25. Appendix A: Complete Flow Catalog (680 Flows)

Below is every flow cataloged from all 13 app versions, organized by platform.


### Airtable iOS (59 flows, 3 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Onboarding | Onboarding | — | Onboarding & Auth | ★ |
| 2 | Home | Home | — | Onboarding & Auth | ★ |
| 3 | Creating a Kanban View | Adding & Creating | — | Views & Data | ★ |
| 4 | Login | Login | — | Onboarding & Auth |  |
| 5 | Sign Up | Signup | — | Onboarding & Auth |  |
| 6 | Forgot Password | Login | — | Onboarding & Auth |  |
| 7 | Home Dashboard | Home | — | Home & Navigation |  |
| 8 | Browse Templates | Browse & Discover | — | Home & Navigation |  |
| 9 | Create New Base | Adding & Creating | — | Home & Navigation |  |
| 10 | Workspace Switcher | Switching Account | — | Home & Navigation |  |
| 11 | Notifications | Notification | — | Home & Navigation |  |
| 12 | Search | Search | — | Home & Navigation |  |
| 13 | Grid View | Home | — | Views & Data |  |
| 14 | Scroll & Navigate Grid | Browsing Tutorial | — | Views & Data |  |
| 15 | Add New Record | Adding & Creating | — | Views & Data |  |
| 16 | Expand Record Detail | Detail View | — | Views & Data |  |
| 17 | Edit Record Fields | Editing & Updating | — | Views & Data |  |
| 18 | Add / Configure Field | Adding & Creating | — | Views & Data |  |
| 19 | Field Type Picker | Select | — | Views & Data |  |
| 20 | Kanban Board View | Home | — | Views & Data |  |
| 21 | Calendar View | Calendar | — | Views & Data |  |
| 22 | Gallery View | Browse & Discover | — | Views & Data |  |
| 23 | Form View | Adding & Creating | — | Views & Data |  |
| 24 | List View | Home | — | Views & Data |  |
| 25 | Create New View | Adding & Creating | — | Views & Data |  |
| 26 | View Switcher | Switching View | — | Views & Data |  |
| 27 | Filter Records | Filtering & Sorting | — | Filtering & Sorting |  |
| 28 | Sort Records | Filtering & Sorting | — | Filtering & Sorting |  |
| 29 | Group Records | Filtering & Sorting | — | Filtering & Sorting |  |
| 30 | Hide / Reorder Fields | Settings & Preferences | — | Filtering & Sorting |  |
| 31 | Color Records | Settings & Preferences | — | Filtering & Sorting |  |
| 32 | Search Within View | Search | — | Filtering & Sorting |  |
| 33 | Linked Record Picker | Select | — | Records & Fields |  |
| 34 | Attachment Viewer | Detail View | — | Records & Fields |  |
| 35 | Upload Attachment | Upload & Download | — | Records & Fields |  |
| 36 | Comments on Record | Chatting & Sending Messages | — | Records & Fields |  |
| 37 | Record Activity | Timeline & History | — | Records & Fields |  |
| 38 | Select Option Picker | Select | — | Records & Fields |  |
| 39 | Date & Time Picker | Select | — | Records & Fields |  |
| 40 | Barcode / QR Scanner | Adding & Creating | — | Records & Fields |  |
| 41 | Share Base | Sharing | — | Sharing & Collaboration |  |
| 42 | Share View Link | Sharing | — | Sharing & Collaboration |  |
| 43 | Invite Collaborators | Inviting Teammates & Friends | — | Sharing & Collaboration |  |
| 44 | Manage Permissions | Settings & Preferences | — | Sharing & Collaboration |  |
| 45 | Table Switcher | Switching View | — | Table Management |  |
| 46 | Create New Table | Adding & Creating | — | Table Management |  |
| 47 | Rename / Delete Table | Editing & Updating | — | Table Management |  |
| 48 | Account Settings | Settings & Preferences | — | Settings & Account |  |
| 49 | Notification Preferences | Settings & Preferences | — | Settings & Account |  |
| 50 | Plan / Subscription Info | Subscription & Paywall | — | Settings & Account |  |
| 51 | Upgrade Plan | Subscription & Paywall | — | Settings & Account |  |
| 52 | App Settings | Settings & Preferences | — | Settings & Account |  |
| 53 | About / Help | Feature Info | — | Settings & Account |  |
| 54 | Offline Mode Banner | Error | — | Misc |  |
| 55 | Sync / Loading | Loading | — | Misc |  |
| 56 | Empty State (No Bases) | Empty State | — | Misc |  |
| 57 | Empty State (No Records) | Empty State | — | Misc |  |
| 58 | Permission Denied | Error | — | Misc |  |
| 59 | Push Notification → Deep Link | Notification | — | Misc |  |

### Airtable Web (59 flows, 0 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Onboarding | Onboarding | — | Onboarding & Auth |  |
| 2 | Onboarding Checklist | Onboarding | — | Onboarding & Auth |  |
| 3 | Landing Page | Home | — | Onboarding & Auth |  |
| 4 | Sign Up | Signup | — | Onboarding & Auth |  |
| 5 | Login | Login | — | Onboarding & Auth |  |
| 6 | Home / Workspace Dashboard | Home | — | Workspace & Navigation |  |
| 7 | Create New Base | Adding & Creating | — | Workspace & Navigation |  |
| 8 | Base from Template | Browse & Discover | — | Workspace & Navigation |  |
| 9 | Import Data | Upload & Download | — | Workspace & Navigation |  |
| 10 | Workspace Settings | Settings & Preferences | — | Workspace & Navigation |  |
| 11 | Grid View | Home | — | Views & Data |  |
| 12 | Kanban Board | Home | — | Views & Data |  |
| 13 | Calendar View | Calendar | — | Views & Data |  |
| 14 | Gallery View | Browse & Discover | — | Views & Data |  |
| 15 | Form View | Adding & Creating | — | Views & Data |  |
| 16 | Timeline / Gantt View | Timeline & History | — | Views & Data |  |
| 17 | List View | Home | — | Views & Data |  |
| 18 | Create New View | Adding & Creating | — | Views & Data |  |
| 19 | Expand Record Detail | Detail View | — | Records & Fields |  |
| 20 | Add / Edit Field | Adding & Creating | — | Records & Fields |  |
| 21 | Field Type Selection | Select | — | Records & Fields |  |
| 22 | Linked Record Selection | Select | — | Records & Fields |  |
| 23 | Attachment Upload | Upload & Download | — | Records & Fields |  |
| 24 | Comments on Record | Chatting & Sending Messages | — | Records & Fields |  |
| 25 | Record Activity / History | Timeline & History | — | Records & Fields |  |
| 26 | Filter Records | Filtering & Sorting | — | Filtering & Sorting |  |
| 27 | Sort Records | Filtering & Sorting | — | Filtering & Sorting |  |
| 28 | Group Records | Filtering & Sorting | — | Filtering & Sorting |  |
| 29 | Hide / Show Fields | Settings & Preferences | — | Filtering & Sorting |  |
| 30 | Color Records | Settings & Preferences | — | Filtering & Sorting |  |
| 31 | Search Records | Search | — | Filtering & Sorting |  |
| 32 | Share Base | Sharing | — | Sharing & Collaboration |  |
| 33 | Share View | Sharing | — | Sharing & Collaboration |  |
| 34 | Invite Team Members | Inviting Teammates & Friends | — | Sharing & Collaboration |  |
| 35 | Permission Settings | Settings & Preferences | — | Sharing & Collaboration |  |
| 36 | Sync View to Another Base | Connecting & Linking | — | Sharing & Collaboration |  |
| 37 | Automations Dashboard | Dashboard | — | Automations |  |
| 38 | Create Automation | Adding & Creating | — | Automations |  |
| 39 | Choose Trigger | Select | — | Automations |  |
| 40 | Configure Action | Settings & Preferences | — | Automations |  |
| 41 | Automation Run History | Timeline & History | — | Automations |  |
| 42 | Test Automation | Acknowledgement & Success | — | Automations |  |
| 43 | Interface Designer | Editing & Updating | — | Interfaces |  |
| 44 | Interface Page View | Home | — | Interfaces |  |
| 45 | Add Interface Element | Adding & Creating | — | Interfaces |  |
| 46 | Interface Layouts | Select | — | Interfaces |  |
| 47 | Extensions Marketplace | Browse & Discover | — | Extensions |  |
| 48 | Extension Panel | Detail View | — | Extensions |  |
| 49 | Scripting Extension | Editing & Updating | — | Extensions |  |
| 50 | Account Settings | Settings & Preferences | — | Admin & Settings |  |
| 51 | Billing & Plans | Pricing | — | Admin & Settings |  |
| 52 | Upgrade Plan | Subscription & Paywall | — | Admin & Settings |  |
| 53 | Workspace Members | Settings & Preferences | — | Admin & Settings |  |
| 54 | API Documentation | Feature Info | — | Admin & Settings |  |
| 55 | Notifications | Notification | — | Misc |  |
| 56 | Help & Support | Feature Info | — | Misc |  |
| 57 | Keyboard Shortcuts | Feature Info | — | Misc |  |
| 58 | Trash / Deleted Records | Deleting & Removing | — | Misc |  |
| 59 | Revision History / Snapshots | Timeline & History | — | Misc |  |

### Asana iOS (63 flows, 7 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Onboarding | Onboarding | — | Onboarding & Auth | ★ |
| 2 | Onboarding (v2) | Onboarding | — | Onboarding & Auth | ★ |
| 3 | Logging In | Logging In | — | Onboarding & Auth | ★ |
| 4 | Moving Task to Another Section | Editing & Updating | — | Task Management | ★ |
| 5 | Marking Task as Milestone | Editing & Updating | — | Task Management | ★ |
| 6 | Marking Task as Approval | Editing & Updating | — | Task Management | ★ |
| 7 | Customizing Push Notifications | Settings & Preferences | — | Settings | ★ |
| 8 | Sign Up | Signup | — | Onboarding & Auth |  |
| 9 | Forgot Password | Login | — | Onboarding & Auth |  |
| 10 | Home Screen | Home | — | Home & Navigation |  |
| 11 | My Tasks | Goal & Task | — | Home & Navigation |  |
| 12 | Inbox / Notifications | Notification | — | Home & Navigation |  |
| 13 | Search | Search | — | Home & Navigation |  |
| 14 | Quick Add (+) Task | Adding & Creating | — | Home & Navigation |  |
| 15 | Create New Task | Adding & Creating | — | Task Management |  |
| 16 | Task Detail View | Detail View | — | Task Management |  |
| 17 | Edit Task Details | Editing & Updating | — | Task Management |  |
| 18 | Set Task Assignee | Select | — | Task Management |  |
| 19 | Set Due Date | Select | — | Task Management |  |
| 20 | Add Subtask | Adding & Creating | — | Task Management |  |
| 21 | Complete / Uncomplete Task | Starting & Completing | — | Task Management |  |
| 22 | Add Comment on Task | Chatting & Sending Messages | — | Task Management |  |
| 23 | Add Attachment | Upload & Download | — | Task Management |  |
| 24 | Set Task Dependencies | Connecting & Linking | — | Task Management |  |
| 25 | Add Task to Project | Adding & Creating | — | Task Management |  |
| 26 | Set Custom Fields | Editing & Updating | — | Task Management |  |
| 27 | Like / React to Task | Reacting | — | Task Management |  |
| 28 | Delete Task | Deleting & Removing | — | Task Management |  |
| 29 | Duplicate Task | Copying & Duplicating | — | Task Management |  |
| 30 | Create New Project | Adding & Creating | — | Project Management |  |
| 31 | Project List View | Home | — | Project Management |  |
| 32 | Project Board View | Home | — | Project Management |  |
| 33 | Project Timeline View | Timeline & History | — | Project Management |  |
| 34 | Project Calendar View | Calendar | — | Project Management |  |
| 35 | Project Overview | Detail View | — | Project Management |  |
| 36 | Project Status Update | Adding & Creating | — | Project Management |  |
| 37 | Project Members & Permissions | Settings & Preferences | — | Project Management |  |
| 38 | Switch Project View | Switching View | — | Project Management |  |
| 39 | Project from Template | Browse & Discover | — | Project Management |  |
| 40 | Goals | Goal & Task | — | Goals & Portfolios |  |
| 41 | Create Goal | Adding & Creating | — | Goals & Portfolios |  |
| 42 | Goal Detail | Detail View | — | Goals & Portfolios |  |
| 43 | Portfolios | Dashboard | — | Goals & Portfolios |  |
| 44 | Teams | Browse & Discover | — | Teams & People |  |
| 45 | Team Detail | Detail View | — | Teams & People |  |
| 46 | People / Member Profile | User / Group Profile | — | Teams & People |  |
| 47 | Invite People | Inviting Teammates & Friends | — | Teams & People |  |
| 48 | Reporting Dashboard | Dashboard | — | Reporting |  |
| 49 | Create Chart / Report | Adding & Creating | — | Reporting |  |
| 50 | Account Settings | Settings & Preferences | — | Settings |  |
| 51 | Profile Settings | User / Group Profile | — | Settings |  |
| 52 | Notification Settings | Settings & Preferences | — | Settings |  |
| 53 | Display Settings | Settings & Preferences | — | Settings |  |
| 54 | Workspace Settings | Settings & Preferences | — | Settings |  |
| 55 | Upgrade / Premium | Subscription & Paywall | — | Settings |  |
| 56 | About / Help | Feature Info | — | Settings |  |
| 57 | Log Out | Logging Out | — | Settings |  |
| 58 | Offline Banner | Error | — | Misc |  |
| 59 | Empty State (No Tasks) | Empty State | — | Misc |  |
| 60 | Empty State (No Projects) | Empty State | — | Misc |  |
| 61 | Celebration Animation | Acknowledgement & Success | — | Misc |  |
| 62 | Deep Link from Notification | Notification | — | Misc |  |
| 63 | Share Task | Sharing | — | Misc |  |

### Asana Web (74 flows, 6 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Landing Page | Home | — | Onboarding & Auth | ★ |
| 2 | Admin Console | Settings & Preferences | — | Onboarding & Auth | ★ |
| 3 | Signing Up for a Demo | Signup | — | Onboarding & Auth | ★ |
| 4 | Enabling Two-Factor Authentication | Settings & Preferences | — | Settings & Security | ★ |
| 5 | Adding an Emoji | Adding & Creating | — | Task Management | ★ |
| 6 | Canceling a Subscription | Subscription & Paywall | — | Settings & Security | ★ |
| 7 | Onboarding | Onboarding | — | Onboarding & Auth |  |
| 8 | Sign Up | Signup | — | Onboarding & Auth |  |
| 9 | Login | Login | — | Onboarding & Auth |  |
| 10 | Forgot Password | Login | — | Onboarding & Auth |  |
| 11 | Pricing Page | Pricing | — | Onboarding & Auth |  |
| 12 | Home Dashboard | Home | — | Home & Navigation |  |
| 13 | My Tasks | Goal & Task | — | Home & Navigation |  |
| 14 | Inbox | Notification | — | Home & Navigation |  |
| 15 | Search | Search | — | Home & Navigation |  |
| 16 | Sidebar Navigation | Home | — | Home & Navigation |  |
| 17 | Create Task (Quick Add) | Adding & Creating | — | Task Management |  |
| 18 | Task Detail Pane | Detail View | — | Task Management |  |
| 19 | Edit Task Details | Editing & Updating | — | Task Management |  |
| 20 | Set Task Assignee | Select | — | Task Management |  |
| 21 | Set Due Date | Select | — | Task Management |  |
| 22 | Add Subtask | Adding & Creating | — | Task Management |  |
| 23 | Complete Task | Starting & Completing | — | Task Management |  |
| 24 | Add Comment | Chatting & Sending Messages | — | Task Management |  |
| 25 | Add Attachment | Upload & Download | — | Task Management |  |
| 26 | Set Dependencies | Connecting & Linking | — | Task Management |  |
| 27 | Add to Multiple Projects | Adding & Creating | — | Task Management |  |
| 28 | Set Custom Fields | Editing & Updating | — | Task Management |  |
| 29 | Create Task Rule / Automation | Adding & Creating | — | Task Management |  |
| 30 | Duplicate Task | Copying & Duplicating | — | Task Management |  |
| 31 | Delete Task | Deleting & Removing | — | Task Management |  |
| 32 | Merge Duplicate Tasks | Editing & Updating | — | Task Management |  |
| 33 | Task Templates | Browse & Discover | — | Task Management |  |
| 34 | Create New Project | Adding & Creating | — | Project Management |  |
| 35 | Project List View | Home | — | Project Management |  |
| 36 | Project Board View | Home | — | Project Management |  |
| 37 | Project Timeline View | Timeline & History | — | Project Management |  |
| 38 | Project Calendar View | Calendar | — | Project Management |  |
| 39 | Project Gantt View | Timeline & History | — | Project Management |  |
| 40 | Project Overview | Detail View | — | Project Management |  |
| 41 | Project Status Update | Adding & Creating | — | Project Management |  |
| 42 | Project Workflow / Rules | Settings & Preferences | — | Project Management |  |
| 43 | Project Permissions | Settings & Preferences | — | Project Management |  |
| 44 | Switch Project View | Switching View | — | Project Management |  |
| 45 | Project from Template | Browse & Discover | — | Project Management |  |
| 46 | Project Dashboard / Charts | Dashboard | — | Project Management |  |
| 47 | Goals | Goal & Task | — | Goals & Portfolios |  |
| 48 | Create Goal | Adding & Creating | — | Goals & Portfolios |  |
| 49 | Goal Detail | Detail View | — | Goals & Portfolios |  |
| 50 | Update Goal Progress | Editing & Updating | — | Goals & Portfolios |  |
| 51 | Portfolios | Dashboard | — | Goals & Portfolios |  |
| 52 | Portfolio Detail | Detail View | — | Goals & Portfolios |  |
| 53 | Teams List | Browse & Discover | — | Teams & People |  |
| 54 | Team Page | Detail View | — | Teams & People |  |
| 55 | Member Profile | User / Group Profile | — | Teams & People |  |
| 56 | Invite People | Inviting Teammates & Friends | — | Teams & People |  |
| 57 | Create Team | Adding & Creating | — | Teams & People |  |
| 58 | Reporting Dashboard | Dashboard | — | Reporting |  |
| 59 | Create Report / Chart | Adding & Creating | — | Reporting |  |
| 60 | Workload View | Dashboard | — | Reporting |  |
| 61 | Account Settings | Settings & Preferences | — | Settings & Security |  |
| 62 | Profile Settings | User / Group Profile | — | Settings & Security |  |
| 63 | Notification Settings | Settings & Preferences | — | Settings & Security |  |
| 64 | Display / Hacks Settings | Settings & Preferences | — | Settings & Security |  |
| 65 | Workspace Settings | Settings & Preferences | — | Settings & Security |  |
| 66 | Billing & Upgrade | Subscription & Paywall | — | Settings & Security |  |
| 67 | Connected Apps / Integrations | Settings & Preferences | — | Settings & Security |  |
| 68 | Data Export / Import | Upload & Download | — | Settings & Security |  |
| 69 | Keyboard Shortcuts | Feature Info | — | Misc |  |
| 70 | What's New / Release Notes | Feature Info | — | Misc |  |
| 71 | Help & Support | Feature Info | — | Misc |  |
| 72 | Empty State (No Tasks) | Empty State | — | Misc |  |
| 73 | Celebration Animation | Acknowledgement & Success | — | Misc |  |
| 74 | Share / Export Project | Sharing | — | Misc |  |

### Calendly iOS (31 flows, 0 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Onboarding | Onboarding | 16 | Onboarding & Auth |  |
| 2 | Logging in | Logging In | 8 | Onboarding & Auth |  |
| 3 | Event types | Home | 2 | Event Types |  |
| 4 | Copying a link | Copying & Duplicating | 2 | Event Types |  |
| 5 | Copying a single-use link | Copying & Duplicating | 2 | Event Types |  |
| 6 | Sharing an event type | Sharing | 3 | Event Types |  |
| 7 | View booking page | Detail View | 2 | Event Types |  |
| 8 | Scheduling an event | Booking & Reserving | 11 | Scheduling |  |
| 9 | Event type detail | Detail View | 5 | Event Types |  |
| 10 | Renaming an event type | Editing & Updating | 4 | Event Types |  |
| 11 | Cloning an event | Copying & Duplicating | 5 | Event Types |  |
| 12 | Editing event duration | Editing & Updating | 5 | Event Types |  |
| 13 | Editing an internal note | Editing & Updating | 4 | Event Types |  |
| 14 | Adding a location | Adding & Creating | 5 | Event Types |  |
| 15 | One-off meeting | Adding & Creating | 3 | Scheduling |  |
| 16 | Scheduling an event (one-off meeting) | Booking & Reserving | 9 | Scheduling |  |
| 17 | Sharing an event | Sharing | 3 | Scheduling |  |
| 18 | Creating a QR code | Adding & Creating | 2 | Event Types |  |
| 19 | Scheduled events | Home | 5 | Scheduling |  |
| 20 | Rescheduling an event | Editing & Updating | 13 | Scheduling |  |
| 21 | Canceling an event | Deleting & Removing | 5 | Scheduling |  |
| 22 | Account | Settings & Preferences | 2 | Settings & Account |  |
| 23 | Account link | Settings & Preferences | 2 | Settings & Account |  |
| 24 | Availability | Settings & Preferences | 2 | Availability |  |
| 25 | Updating working hours | Editing & Updating | 6 | Availability |  |
| 26 | Adding a date override | Adding & Creating | 8 | Availability |  |
| 27 | Editing my default message | Editing & Updating | 3 | Settings & Account |  |
| 28 | Help and support | Feature Info | 2 | Settings & Account |  |
| 29 | Notifications | Settings & Preferences | 3 | Settings & Account |  |
| 30 | Sending feedback | Giving Feedback | 7 | Settings & Account |  |
| 31 | Logging out | Logging Out | 3 | Settings & Account |  |

### Calendly Web (68 flows, 31 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Onboarding | Onboarding | — | Onboarding & Auth | ★ |
| 2 | Logging In | Logging In | — | Onboarding & Auth | ★ |
| 3 | Event Types | Home | — | Event Types | ★ |
| 4 | Copying a Link | Copying & Duplicating | — | Event Types | ★ |
| 5 | Copying a Single-Use Link | Copying & Duplicating | — | Event Types | ★ |
| 6 | Sharing an Event Type | Sharing | — | Event Types | ★ |
| 7 | View Booking Page | Detail View | — | Event Types | ★ |
| 8 | Scheduling an Event | Booking & Reserving | — | Scheduling | ★ |
| 9 | Event Type Detail | Detail View | — | Event Types | ★ |
| 10 | Renaming an Event Type | Editing & Updating | — | Event Types | ★ |
| 11 | Cloning an Event | Copying & Duplicating | — | Event Types | ★ |
| 12 | Editing Event Duration | Editing & Updating | — | Event Types | ★ |
| 13 | Editing an Internal Note | Editing & Updating | — | Event Types | ★ |
| 14 | Adding a Location | Adding & Creating | — | Event Types | ★ |
| 15 | One-Off Meeting | Adding & Creating | — | Scheduling | ★ |
| 16 | Scheduling an Event (One-Off) | Booking & Reserving | — | Scheduling | ★ |
| 17 | Sharing an Event | Sharing | — | Scheduling | ★ |
| 18 | Creating a QR Code | Adding & Creating | — | Event Types | ★ |
| 19 | Scheduled Events | Home | — | Scheduling | ★ |
| 20 | Rescheduling an Event | Editing & Updating | — | Scheduling | ★ |
| 21 | Canceling an Event | Deleting & Removing | — | Scheduling | ★ |
| 22 | Account | Settings & Preferences | — | Settings & Account | ★ |
| 23 | Account Link | Settings & Preferences | — | Settings & Account | ★ |
| 24 | Availability | Settings & Preferences | — | Availability | ★ |
| 25 | Updating Working Hours | Editing & Updating | — | Availability | ★ |
| 26 | Adding a Date Override | Adding & Creating | — | Availability | ★ |
| 27 | Editing My Default Message | Editing & Updating | — | Settings & Account | ★ |
| 28 | Help and Support | Feature Info | — | Settings & Account | ★ |
| 29 | Notifications | Settings & Preferences | — | Settings & Account | ★ |
| 30 | Sending Feedback | Giving Feedback | — | Settings & Account | ★ |
| 31 | Logging Out | Logging Out | — | Settings & Account | ★ |
| 32 | Landing Page | Home | — | Onboarding & Auth |  |
| 33 | Sign Up | Signup | — | Onboarding & Auth |  |
| 34 | Pricing Page | Pricing | — | Onboarding & Auth |  |
| 35 | Forgot Password | Login | — | Onboarding & Auth |  |
| 36 | Create New Event Type | Adding & Creating | — | Event Types |  |
| 37 | Event Type - What Questions | Settings & Preferences | — | Event Types |  |
| 38 | Event Type - When (Scheduling) | Settings & Preferences | — | Event Types |  |
| 39 | Event Type - Notifications & Workflows | Settings & Preferences | — | Event Types |  |
| 40 | Event Type - Booking Page | Settings & Preferences | — | Event Types |  |
| 41 | Workflows Dashboard | Dashboard | — | Workflows |  |
| 42 | Create Workflow | Adding & Creating | — | Workflows |  |
| 43 | Workflow Templates | Browse & Discover | — | Workflows |  |
| 44 | Routing Forms | Dashboard | — | Routing |  |
| 45 | Create Routing Form | Adding & Creating | — | Routing |  |
| 46 | Team Dashboard | Home | — | Teams |  |
| 47 | Team Members | Settings & Preferences | — | Teams |  |
| 48 | Round Robin Event Type | Adding & Creating | — | Teams |  |
| 49 | Collective Event Type | Adding & Creating | — | Teams |  |
| 50 | Integrations Dashboard | Browse & Discover | — | Integrations |  |
| 51 | Connect Calendar | Connecting & Linking | — | Integrations |  |
| 52 | Connect Video Conferencing | Connecting & Linking | — | Integrations |  |
| 53 | Connect CRM | Connecting & Linking | — | Integrations |  |
| 54 | Embed Settings | Settings & Preferences | — | Integrations |  |
| 55 | Analytics Dashboard | Dashboard | — | Analytics |  |
| 56 | Event Type Analytics | Reporting | — | Analytics |  |
| 57 | Profile Settings | User / Group Profile | — | Settings & Account |  |
| 58 | Calendar Connection | Settings & Preferences | — | Settings & Account |  |
| 59 | Billing & Plans | Subscription & Paywall | — | Settings & Account |  |
| 60 | Upgrade Plan | Subscription & Paywall | — | Settings & Account |  |
| 61 | Branding | Settings & Preferences | — | Settings & Account |  |
| 62 | Admin Settings | Settings & Preferences | — | Settings & Account |  |
| 63 | Booking Page - Select Date | Booking & Reserving | — | Booking Page |  |
| 64 | Booking Page - Select Time | Booking & Reserving | — | Booking Page |  |
| 65 | Booking Page - Enter Details | Booking & Reserving | — | Booking Page |  |
| 66 | Booking Confirmation | Acknowledgement & Success | — | Booking Page |  |
| 67 | Reschedule Page (Invitee) | Editing & Updating | — | Booking Page |  |
| 68 | Cancel Page (Invitee) | Deleting & Removing | — | Booking Page |  |

### DocuSign iOS (36 flows, 0 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Onboarding | Onboarding | — | First-time user experience introducing DocuSign features: sign, send, manage documents. Includes app tour and feature highlights. |  |
| 2 | Sign Up | Onboarding / Creating Account | — | New account creation flow with email, name, password. Includes social sign-in options (Google, Apple). |  |
| 3 | Login | Logging In | — | Login with email/password, biometric (Face ID/Touch ID), or SSO. Includes 'Forgot Password' path. |  |
| 4 | Forgot Password | Logging In | — | Password reset flow: enter email, receive code, set new password, confirmation. |  |
| 5 | Biometric Setup | Settings & Preferences | — | Setting up Face ID or Touch ID for quick app access. |  |
| 6 | Home | Home | — | Main home screen with action items (waiting for you, action required), recent documents, and task list. |  |
| 7 | Inbox / Action Required | Home | — | Inbox view showing envelopes awaiting signature, review, or action. Filtered by status. |  |
| 8 | Search Documents | Search | — | Searching envelopes and documents by name, sender, date, or status. |  |
| 9 | Notifications | Notification | — | Push notification list for signing requests, completed documents, and reminders. |  |
| 10 | Signing a Document | Signing / Editing & Updating | — | Core signing flow: open envelope → review document → tap guided fields → add signature/initials/date → confirm → finish signing. |  |
| 11 | Adopting a Signature | Adding & Creating | — | Creating/adopting a signature: draw with finger, type name, or upload image. Includes initials creation. |  |
| 12 | Adding Signature Fields | Adding & Creating | — | Placing signature, initial, date, and text fields onto a document before sending. |  |
| 13 | Document Review | Detail View | — | Reviewing document pages before signing, with pinch-to-zoom and page navigation. |  |
| 14 | Completing & Submitting | Acknowledgement & Success | — | Confirmation screen after signing is complete, with options to view/download completed document. |  |
| 15 | Sending a Document | Adding & Creating | — | Full send flow: upload document → add recipients → place fields → add message → review → send. |  |
| 16 | Upload Document | Upload & Download | — | Uploading a document via camera scan, photo library, Files app, cloud storage (Google Drive, Dropbox, Box). |  |
| 17 | Add Recipients | Adding & Creating | — | Adding signers, CC recipients with name, email, phone. Includes contact book integration. |  |
| 18 | Prepare Document Fields | Editing & Updating | — | Tagging document with Sign Here, Initial, Date, Text, Checkbox fields per recipient. |  |
| 19 | Send Review & Confirm | Acknowledgement & Success | — | Final review of envelope details before sending. Shows recipients, document, message preview. |  |
| 20 | Using a Template | Select | — | Selecting a saved template, pre-filling recipient info, customizing fields, and sending. |  |
| 21 | Template Selection | Browse & Discover | — | Browsing and searching available templates by name or category. |  |
| 22 | Envelope Details | Detail View | — | Viewing envelope details: status, recipients, history/timeline, documents, and actions. |  |
| 23 | Envelope History / Activity | Timeline & History | — | Activity log showing when envelope was sent, viewed, signed by each recipient. |  |
| 24 | Void / Delete Envelope | Deleting & Removing | — | Voiding or deleting an envelope with reason input and confirmation. |  |
| 25 | Resend / Remind | Chatting & Sending Messages | — | Resending envelope or sending a reminder to pending signers. |  |
| 26 | Download / Share Completed | Upload & Download / Sharing | — | Downloading or sharing completed signed documents via email, AirDrop, Files, etc. |  |
| 27 | Account Settings | Settings & Preferences | — | Account settings: profile info, notification preferences, signature management, security, linked accounts. |  |
| 28 | Manage Signatures | Settings & Preferences | — | Viewing, editing, and deleting saved signatures and initials. |  |
| 29 | Notification Preferences | Settings & Preferences | — | Configuring push and email notification preferences for various envelope events. |  |
| 30 | Switch Account | Logging In / Logging Out | — | Switching between multiple DocuSign accounts or organizations. |  |
| 31 | Logging Out | Logging Out | — | Confirm logout dialog and session termination. |  |
| 32 | In-Person Signing | Signing / Guided Tour | — | Hosting in-person signing: select envelope → hand device to signer → signer reviews and signs → host confirms. |  |
| 33 | Offline Signing | Signing / Sync | — | Signing documents offline. Envelopes sync automatically when device reconnects to internet. |  |
| 34 | Camera Scan Document | Adding & Creating | — | Using device camera to scan a physical document into a PDF for signing or sending. |  |
| 35 | Help & Support | Feature Info | — | Help center with FAQs, contact support, and guided troubleshooting. |  |
| 36 | Rate App / Feedback | Giving Feedback | — | In-app prompt to rate DocuSign on the App Store or provide feedback. |  |

### DocuSign Web (92 flows, 0 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Home / Agreement Dashboard | Home | — | Main landing page showing agreements requiring action with sidebar navigation |  |
| 2 | Action Required | Home | — | Envelopes needing user's signature or attention |  |
| 3 | Waiting for Others | Home | — | Envelopes sent, awaiting other recipients' signatures |  |
| 4 | Expiring Soon | Home | — | Envelopes nearing expiration deadline |  |
| 5 | Completed Agreements | Home | — | Archive of fully executed/signed agreements |  |
| 6 | Drafts | Home | — | Unsent envelope drafts |  |
| 7 | Deleted / Trash | Home | — | Voided and deleted envelopes |  |
| 8 | Inbox (All) | Home | — | All envelopes across all statuses |  |
| 9 | Sent | Home | — | All sent envelopes |  |
| 10 | Search Envelopes | Search | — | Global search across all agreements |  |
| 11 | Advanced Filters | Filtering & Sorting | — | Filter by status, date range, sender, folder, labels |  |
| 12 | Search Results | Search | — | Filtered envelope results with status indicators |  |
| 13 | Envelope Review (Pre-Sign) | Detail View | — | Pre-signing summary with Continue button |  |
| 14 | Electronic Record Consent | Acknowledgement & Success | — | Legal consent/disclosure acceptance |  |
| 15 | Document Signing View | Editing & Updating | — | Main signing canvas with guided yellow fields and navigation |  |
| 16 | Signature Field - Click to Sign | Editing & Updating | — | Highlighted signature field for input |  |
| 17 | Adopt Signature - Draw | Adding & Creating | — | Draw signature with mouse/trackpad |  |
| 18 | Adopt Signature - Type | Adding & Creating | — | Type name to generate styled signatures |  |
| 19 | Adopt Signature - Upload | Adding & Creating | — | Upload signature image |  |
| 20 | Initial Field | Editing & Updating | — | Add initials to designated field |  |
| 21 | Date Signed Field | Editing & Updating | — | Date field auto-populated or manual |  |
| 22 | Text Input Field | Editing & Updating | — | Free-text input on document |  |
| 23 | Checkbox / Radio Field | Select | — | Checkbox or radio selection on document |  |
| 24 | Dropdown Field | Select | — | Dropdown list selection on document |  |
| 25 | Attachment Field | Upload & Download | — | Upload attachment required by sender |  |
| 26 | Payment Field | Checkout | — | Enter payment info if required |  |
| 27 | Signing Complete | Acknowledgement & Success | — | Confirmation with download/print/share options |  |
| 28 | Decline to Sign | Giving Feedback | — | Decline signing with reason |  |
| 29 | Start New Envelope | Adding & Creating | — | Start from scratch, template, or upload |  |
| 30 | Upload Documents | Upload & Download | — | Upload via drag-and-drop, browse, or cloud storage |  |
| 31 | Add Recipients | Adding & Creating | — | Add signers, CC with name, email, signing order |  |
| 32 | Set Signing Order | Reordering | — | Configure sequential/parallel routing |  |
| 33 | Recipient Authentication | Settings & Preferences | — | Set auth requirements: SMS, ID verify, access code |  |
| 34 | Add Message | Chatting & Sending Messages | — | Compose email subject and message for envelope |  |
| 35 | Prepare / Tagging View | Editing & Updating | — | Place fields on document per recipient |  |
| 36 | Field Properties Panel | Settings & Preferences | — | Configure field properties: required, validation, logic |  |
| 37 | Standard Fields Toolbar | Adding & Creating | — | Signature, Initial, Date, Text, Checkbox, Dropdown fields |  |
| 38 | Advanced Fields | Adding & Creating | — | Formula, Payment, Approve/Decline, Stamp fields |  |
| 39 | Preview Envelope | Detail View | — | Preview how recipients see the document |  |
| 40 | Review & Send | Acknowledgement & Success | — | Final review before sending |  |
| 41 | Send Confirmation | Acknowledgement & Success | — | Envelope sent successfully |  |
| 42 | Templates List | Browse & Discover | — | Browse/search saved templates |  |
| 43 | Template Detail | Detail View | — | Template preview with roles and fields |  |
| 44 | Create / Edit Template | Editing & Updating | — | Build or modify template |  |
| 45 | Template Folders | Browse & Discover | — | Organize templates with sharing |  |
| 46 | Use Template | Select | — | Select template, populate recipients, send |  |
| 47 | Shared Templates | Browse & Discover | — | Organization-shared templates |  |
| 48 | Envelope Details | Detail View | — | Full envelope info: summary, recipients, history |  |
| 49 | Envelope History / Audit Trail | Timeline & History | — | Chronological activity log |  |
| 50 | Recipients Status | Detail View | — | Per-recipient signing status |  |
| 51 | Certificate of Completion | Detail View | — | Official audit certificate with timestamps |  |
| 52 | Correct Envelope | Editing & Updating | — | Modify sent envelope |  |
| 53 | Void Envelope | Deleting & Removing | — | Void envelope with reason |  |
| 54 | Resend Envelope | Chatting & Sending Messages | — | Resend notification |  |
| 55 | Send Reminder | Chatting & Sending Messages | — | Reminder to pending signers |  |
| 56 | Download Documents | Upload & Download | — | Download signed PDFs and certificate |  |
| 57 | Move to Folder | Select | — | Move envelope to folder |  |
| 58 | Contacts List | Browse & Discover | — | Address book of recipients |  |
| 59 | Contact Detail | User / Group Profile | — | Contact info with history |  |
| 60 | Add / Edit Contact | Adding & Creating | — | Create or edit contact |  |
| 61 | Signing Groups | Browse & Discover | — | Manage recipient groups |  |
| 62 | PowerForms List | Browse & Discover | — | Self-service signing URLs |  |
| 63 | Create PowerForm | Adding & Creating | — | Create URL-based form |  |
| 64 | Web Forms Builder | Editing & Updating | — | Design web forms with logic |  |
| 65 | Bulk Send Dashboard | Dashboard | — | Monitor bulk operations |  |
| 66 | Bulk Send Setup | Adding & Creating | — | Upload CSV and map fields |  |
| 67 | Bulk Send Status | Dashboard | — | Per-envelope status in batch |  |
| 68 | Account Settings | Settings & Preferences | — | General account configuration |  |
| 69 | Profile Settings | User / Group Profile | — | Personal profile management |  |
| 70 | Signature Management | Settings & Preferences | — | Manage saved signatures/initials |  |
| 71 | Notification Preferences | Settings & Preferences | — | Email notification config |  |
| 72 | Security Settings | Settings & Preferences | — | Password, 2FA, sessions |  |
| 73 | Connected Apps | Settings & Preferences | — | Manage integrations |  |
| 74 | Branding | Settings & Preferences | — | Custom signing UI appearance |  |
| 75 | Users & Groups (Admin) | Settings & Preferences | — | Manage org users and roles |  |
| 76 | Billing & Plans | Pricing | — | Plan details, usage, invoices |  |
| 77 | API & Keys | Settings & Preferences | — | API keys and webhooks |  |
| 78 | Signing Settings | Settings & Preferences | — | Reminders, expiration, options |  |
| 79 | Folders Management | Settings & Preferences | — | Create/manage folders |  |
| 80 | Login Page | Login | — | Email/password or SSO login |  |
| 81 | SSO Login | Login | — | Enterprise SSO redirect |  |
| 82 | Forgot Password | Login | — | Password reset flow |  |
| 83 | Sign Up | Signup | — | New account registration |  |
| 84 | Two-Factor Auth | Verification | — | Enter verification code |  |
| 85 | Help & Support | Feature Info | — | In-app help center |  |
| 86 | Guided Tour | Guided Tour & Tutorial | — | First-time user walkthrough |  |
| 87 | Error / 404 | Error | — | Content not found page |  |
| 88 | Empty State | Empty State | — | Empty inbox prompt |  |
| 89 | Reports Dashboard | Dashboard | — | Agreement analytics overview |  |
| 90 | Envelope Report | Reporting | — | Detailed envelope status report |  |
| 91 | User Activity Report | Reporting | — | Per-user activity breakdown |  |
| 92 | Export Report | Upload & Download | — | Export data as CSV/Excel |  |

### Linear iOS (37 flows, 2 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Onboarding | Onboarding | 8 | Onboarding & Auth | ★ |
| 2 | Logging in | Logging In | 5 | Onboarding & Auth |  |
| 3 | Logging out | Logging Out | 2 | Onboarding & Auth |  |
| 4 | Switching accounts | Switching Accounts | 3 | Onboarding & Auth |  |
| 5 | Inbox | Home | 4 | Home & Navigation |  |
| 6 | My Issues | Home | 4 | Home & Navigation |  |
| 7 | Home | Home | 3 | Home & Navigation |  |
| 8 | Creating an issue | Adding & Creating | 6 | Issue Management |  |
| 9 | Issue detail | Detail View | 5 | Issue Management |  |
| 10 | Editing an issue | Editing & Updating | 4 | Issue Management |  |
| 11 | Changing issue status | Editing & Updating | 3 | Issue Management |  |
| 12 | Changing issue priority | Editing & Updating | 3 | Issue Management |  |
| 13 | Assigning an issue | Editing & Updating | 3 | Issue Management |  |
| 14 | Adding a label | Adding & Creating | 3 | Issue Management |  |
| 15 | Adding a comment | Adding & Creating | 3 | Issue Management |  |
| 16 | Creating a sub-issue | Adding & Creating | 4 | Issue Management |  |
| 17 | Archiving an issue | Deleting & Removing | 2 | Issue Management |  |
| 18 | Copying branch name | Copying & Duplicating | 2 | Issue Management |  |
| 19 | Filtering issues | Filtering & Sorting | 5 | Filtering & Search |  |
| 20 | Searching | Searching | 4 | Filtering & Search |  |
| 21 | Sorting issues | Filtering & Sorting | 3 | Filtering & Search |  |
| 22 | Switching views | Settings & Preferences | 3 | Views |  |
| 23 | Switching to dark mode | Settings & Preferences | 6 | Views | ★ |
| 24 | Custom views | Browsing & Exploring | 3 | Views |  |
| 25 | Projects list | Home | 3 | Projects |  |
| 26 | Project detail | Detail View | 5 | Projects |  |
| 27 | Creating a project | Adding & Creating | 5 | Projects |  |
| 28 | Editing a project | Editing & Updating | 3 | Projects |  |
| 29 | Current cycle | Home | 3 | Cycles |  |
| 30 | Cycle detail | Detail View | 4 | Cycles |  |
| 31 | Team issues | Browsing & Exploring | 4 | Teams |  |
| 32 | Team members | Detail View | 3 | Teams |  |
| 33 | Triage | Reviewing & Evaluating | 4 | Teams |  |
| 34 | Account settings | Settings & Preferences | 3 | Settings & Account |  |
| 35 | Notification settings | Settings & Preferences | 3 | Settings & Account |  |
| 36 | Workspace settings | Settings & Preferences | 3 | Settings & Account |  |
| 37 | About / Help | Feature Info | 2 | Settings & Account |  |

### Linear Web (44 flows, 5 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Onboarding | Onboarding | 26 | Onboarding & Auth | ★ |
| 2 | Logging in | Logging In | 4 | Onboarding & Auth | ★ |
| 3 | Landing page | Landing Page | 10 | Onboarding & Auth | ★ |
| 4 | Changelog | Feature Info | 4 | Product Updates | ★ |
| 5 | Linear 2022 Release | Feature Info | 9 | Product Updates | ★ |
| 6 | Inbox | Home | 6 | Home & Navigation |  |
| 7 | My Issues | Home | 5 | Home & Navigation |  |
| 8 | Home dashboard | Home | 4 | Home & Navigation |  |
| 9 | Command menu | Browsing & Exploring | 5 | Home & Navigation |  |
| 10 | Creating an issue | Adding & Creating | 8 | Issue Management |  |
| 11 | Issue detail | Detail View | 7 | Issue Management |  |
| 12 | Editing issue properties | Editing & Updating | 5 | Issue Management |  |
| 13 | Changing issue status | Editing & Updating | 3 | Issue Management |  |
| 14 | Sub-issues | Adding & Creating | 4 | Issue Management |  |
| 15 | Commenting on an issue | Adding & Creating | 4 | Issue Management |  |
| 16 | Archiving issues | Deleting & Removing | 3 | Issue Management |  |
| 17 | Bulk actions on issues | Editing & Updating | 4 | Issue Management |  |
| 18 | Board view | Browsing & Exploring | 4 | Views & Filtering |  |
| 19 | List view | Browsing & Exploring | 4 | Views & Filtering |  |
| 20 | Filtering issues | Filtering & Sorting | 6 | Views & Filtering |  |
| 21 | Sorting issues | Filtering & Sorting | 3 | Views & Filtering |  |
| 22 | Display options | Settings & Preferences | 4 | Views & Filtering |  |
| 23 | Custom views | Adding & Creating | 5 | Views & Filtering |  |
| 24 | Switching to dark mode | Settings & Preferences | 5 | Views & Filtering |  |
| 25 | Projects overview | Home | 4 | Projects |  |
| 26 | Project detail | Detail View | 7 | Projects |  |
| 27 | Creating a project | Adding & Creating | 6 | Projects |  |
| 28 | Project updates | Adding & Creating | 4 | Projects |  |
| 29 | Active cycle | Home | 4 | Cycles |  |
| 30 | Cycle detail | Detail View | 5 | Cycles |  |
| 31 | Cycle planning | Adding & Creating | 4 | Cycles |  |
| 32 | Initiatives | Browsing & Exploring | 4 | Initiatives & Roadmap |  |
| 33 | Roadmap timeline | Browsing & Exploring | 4 | Initiatives & Roadmap |  |
| 34 | Team overview | Home | 4 | Teams & Collaboration |  |
| 35 | Triage | Reviewing & Evaluating | 5 | Teams & Collaboration |  |
| 36 | Team settings | Settings & Preferences | 4 | Teams & Collaboration |  |
| 37 | Workspace settings | Settings & Preferences | 5 | Settings & Workspace |  |
| 38 | Integrations | Settings & Preferences | 5 | Settings & Workspace |  |
| 39 | Notifications settings | Settings & Preferences | 4 | Settings & Workspace |  |
| 40 | Account preferences | Settings & Preferences | 4 | Settings & Workspace |  |
| 41 | Global search | Searching | 5 | Search & Insights |  |
| 42 | Insights & analytics | Browsing & Exploring | 5 | Search & Insights |  |
| 43 | Documents | Adding & Creating | 4 | Documents |  |
| 44 | Document editor | Editing & Updating | 5 | Documents |  |

### Notion iOS (37 flows, 10 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Onboarding | Onboarding | 29 | Onboarding & Auth | ★ |
| 2 | Logging in | Logging In | 9 | Onboarding & Auth | ★ |
| 3 | Deleting an account | Deleting & Removing | 4 | Onboarding & Auth | ★ |
| 4 | Logging out | Logging Out | 3 | Onboarding & Auth |  |
| 5 | Switching workspace | Switching Accounts | 3 | Onboarding & Auth |  |
| 6 | Home | Home | 4 | Home & Navigation |  |
| 7 | Search | Searching | 5 | Home & Navigation |  |
| 8 | Side navigation | Browsing & Exploring | 4 | Home & Navigation |  |
| 9 | Inbox / Notifications | Home | 3 | Home & Navigation |  |
| 10 | Creating a page | Adding & Creating | 5 | Page Editing |  |
| 11 | Block menu (slash command) | Browsing & Exploring | 5 | Page Editing |  |
| 12 | Adding a code block | Adding & Creating | 11 | Page Editing | ★ |
| 13 | Adding a callout | Adding & Creating | 4 | Page Editing | ★ |
| 14 | Text formatting | Editing & Updating | 4 | Page Editing |  |
| 15 | Adding an image | Adding & Creating | 4 | Page Editing |  |
| 16 | Page options | Settings & Preferences | 4 | Page Editing |  |
| 17 | Moving a page | Editing & Updating | 3 | Page Editing |  |
| 18 | Adding a comment | Adding & Creating | 4 | Comments & Collaboration |  |
| 19 | Replying a comment | Adding & Creating | 5 | Comments & Collaboration | ★ |
| 20 | Deleting a comment | Deleting & Removing | 3 | Comments & Collaboration | ★ |
| 21 | Creating a database | Adding & Creating | 5 | Databases |  |
| 22 | Database views | Browsing & Exploring | 5 | Databases |  |
| 23 | Adding new properties | Adding & Creating | 3 | Databases | ★ |
| 24 | Filtering database | Filtering & Sorting | 4 | Databases |  |
| 25 | Sorting database | Filtering & Sorting | 3 | Databases |  |
| 26 | Database templates | Adding & Creating | 3 | Databases |  |
| 27 | Sharing a page | Sharing | 5 | Sharing & Permissions |  |
| 28 | Changing search engine indexing | Settings & Preferences | 5 | Sharing & Permissions | ★ |
| 29 | Inviting members | Adding & Creating | 3 | Sharing & Permissions |  |
| 30 | Turning page into wiki | Editing & Updating | 5 | Wiki & Knowledge | ★ |
| 31 | Teamspaces | Browsing & Exploring | 4 | Wiki & Knowledge |  |
| 32 | Notion AI | Adding & Creating | 5 | AI Features |  |
| 33 | AI Q&A | Searching | 3 | AI Features |  |
| 34 | Account settings | Settings & Preferences | 4 | Settings |  |
| 35 | Appearance settings | Settings & Preferences | 3 | Settings |  |
| 36 | Notification settings | Settings & Preferences | 3 | Settings |  |
| 37 | Import / Export | Importing & Exporting | 3 | Settings |  |

### Notion Web (42 flows, 8 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Onboarding | Onboarding | 31 | Onboarding & Auth | ★ |
| 2 | Landing page | Landing Page | 14 | Onboarding & Auth | ★ |
| 3 | Creating a workspace | Adding & Creating | 15 | Onboarding & Auth | ★ |
| 4 | Logging out | Logging Out | 5 | Onboarding & Auth | ★ |
| 5 | Resetting password | Resetting Password | 7 | Onboarding & Auth | ★ |
| 6 | Logging in | Logging In | 5 | Onboarding & Auth |  |
| 7 | Creating a new page | Adding & Creating | 5 | Page Editing |  |
| 8 | Slash command menu | Browsing & Exploring | 6 | Page Editing |  |
| 9 | Block types & formatting | Editing & Updating | 8 | Page Editing |  |
| 10 | Drag & drop blocks | Editing & Updating | 3 | Page Editing |  |
| 11 | Adding an image | Adding & Creating | 4 | Page Editing |  |
| 12 | Adding a table | Adding & Creating | 5 | Page Editing |  |
| 13 | Creating a row header | Turning On/Off | 3 | Page Editing | ★ |
| 14 | Page icon & cover | Editing & Updating | 4 | Page Editing |  |
| 15 | Comments & discussions | Adding & Creating | 5 | Page Editing |  |
| 16 | Creating a database | Adding & Creating | 6 | Databases |  |
| 17 | Database views | Browsing & Exploring | 7 | Databases |  |
| 18 | Database properties | Adding & Creating | 5 | Databases |  |
| 19 | Filtering database | Filtering & Sorting | 5 | Databases |  |
| 20 | Sorting database | Filtering & Sorting | 3 | Databases |  |
| 21 | Database templates | Adding & Creating | 4 | Databases |  |
| 22 | Linked databases | Adding & Creating | 4 | Databases |  |
| 23 | Relations & rollups | Adding & Creating | 4 | Databases |  |
| 24 | Turning a page into a wiki | Editing & Updating | 11 | Wiki & Knowledge | ★ |
| 25 | Teamspaces | Browsing & Exploring | 5 | Wiki & Knowledge |  |
| 26 | Notion AI writing | Adding & Creating | 6 | AI Features |  |
| 27 | Rating an AI answer | Giving Feedback | 3 | AI Features | ★ |
| 28 | AI Q&A / Search | Searching | 4 | AI Features |  |
| 29 | Quick search | Searching | 5 | Search & Navigation |  |
| 30 | Side navigation | Browsing & Exploring | 4 | Search & Navigation |  |
| 31 | Breadcrumbs & page tree | Browsing & Exploring | 3 | Search & Navigation |  |
| 32 | Sharing a page | Sharing | 6 | Sharing & Collaboration |  |
| 33 | Inviting members | Adding & Creating | 4 | Sharing & Collaboration |  |
| 34 | Page history & versions | Browsing & Exploring | 4 | Sharing & Collaboration |  |
| 35 | Switching to dark mode | Settings & Preferences | 5 | Settings & Configuration |  |
| 36 | Workspace settings | Settings & Preferences | 6 | Settings & Configuration |  |
| 37 | Import & export | Importing & Exporting | 5 | Settings & Configuration |  |
| 38 | Integrations & connections | Settings & Preferences | 5 | Settings & Configuration |  |
| 39 | Templates gallery | Browsing & Exploring | 5 | Settings & Configuration |  |
| 40 | Automations | Adding & Creating | 5 | Automation & Advanced |  |
| 41 | Formulas | Editing & Updating | 4 | Automation & Advanced |  |
| 42 | Synced blocks | Adding & Creating | 3 | Automation & Advanced |  |

### PandaDoc Web (38 flows, 3 confirmed)

| # | Flow | Category | Screens | Section | Confirmed |
|---|------|----------|---------|---------|-----------|
| 1 | Onboarding | Onboarding | 12 | Onboarding & Auth | ★ |
| 2 | Logging in | Logging In | 4 | Onboarding & Auth |  |
| 3 | Landing page | Landing Page | 10 | Onboarding & Auth |  |
| 4 | Accepting an invite | Onboarding | 5 | Onboarding & Auth |  |
| 5 | Logging out | Logging Out | 2 | Onboarding & Auth |  |
| 6 | Creating a document | Adding & Creating | 8 | Document Creation |  |
| 7 | Document editor | Editing & Updating | 7 | Document Creation | ★ |
| 8 | Using a template | Browsing & Exploring | 5 | Document Creation |  |
| 9 | Adding content blocks | Adding & Creating | 5 | Document Creation |  |
| 10 | Adding a pricing table | Adding & Creating | 5 | Document Creation |  |
| 11 | Content library | Browsing & Exploring | 4 | Document Creation |  |
| 12 | Adding variables | Adding & Creating | 4 | Document Creation |  |
| 13 | Document settings | Settings & Preferences | 4 | Document Creation |  |
| 14 | Sending a document | Sharing | 6 | Sending & Signing |  |
| 15 | E-signing a document | Signing & Verifying | 8 | Sending & Signing |  |
| 16 | Setting signing order | Settings & Preferences | 4 | Sending & Signing |  |
| 17 | Signer authentication | Signing & Verifying | 4 | Sending & Signing |  |
| 18 | Bulk send | Sharing | 5 | Sending & Signing |  |
| 19 | Document dashboard | Home | 5 | Tracking & Analytics |  |
| 20 | Document analytics | Browsing & Exploring | 5 | Tracking & Analytics |  |
| 21 | Audit trail | Detail View | 4 | Tracking & Analytics |  |
| 22 | Approval workflow | Reviewing & Evaluating | 6 | Approvals & Workflows |  |
| 23 | Requesting approval | Sharing | 4 | Approvals & Workflows |  |
| 24 | Approving a document | Reviewing & Evaluating | 4 | Approvals & Workflows |  |
| 25 | Contacts | Home | 4 | Contacts & CRM |  |
| 26 | Contact detail | Detail View | 4 | Contacts & CRM |  |
| 27 | CRM integration | Settings & Preferences | 5 | Contacts & CRM |  |
| 28 | Template editor | Editing & Updating | 6 | Templates & Library |  |
| 29 | Managing templates | Browsing & Exploring | 4 | Templates & Library |  |
| 30 | Collecting payment | Adding & Creating | 5 | Payments |  |
| 31 | Workspace settings | Settings & Preferences | 5 | Settings & Admin |  |
| 32 | Team management | Settings & Preferences | 5 | Settings & Admin |  |
| 33 | License upgrade | Upgrading & Subscribing | 3 | Settings & Admin | ★ |
| 34 | Integrations | Settings & Preferences | 5 | Settings & Admin |  |
| 35 | Notification settings | Settings & Preferences | 3 | Settings & Admin |  |
| 36 | Billing & plans | Settings & Preferences | 4 | Settings & Admin |  |
| 37 | Creating a form | Adding & Creating | 5 | Forms |  |
| 38 | Form submissions | Home | 4 | Forms |  |


---

## 26. Appendix B: UI Element Taxonomy (422 Elements)

All unique UI elements/tags extracted from 680 flows across 13 app versions:


- AI Prompt Bar · API Key · Accept/Decline · Accept/Reject · Access Code
- Access Level · Account Settings · Acknowledgement · Action · Action Button
- Action Menu · Action Picker · Activity Feed · Add Rule · Amount
- Analytics · Animation · Approve/Reject Button · Approver Picker · Ascending/Descending
- Assignee Picker · Attachment · Authentication · Avatar · Avatar Picker
- Backlog · Badge · Banner · Bar Graph · Biometric Icon
- Block · Board · Board Layout · Bold · Border Highlight
- Bottom Sheet · Branding · Breadcrumb · Bulk Send · Burndown Chart
- Button · CRM Data · CSV Upload · CTA · CTA Button
- Calendar · Calendar Icon · Callout · Callout Block · Camera
- Card · Card Grid · Carousel · Category · Category Filter
- Category Group · Cell · Certificate · Chart · Chat Interface
- Chat Widget · Checkbox · Chip · Citation · Cloud Storage Icons
- Code · Code Block · Code Input · Code Text · Collaborator Form
- Color · Color Code · Color Indicator · Color Picker · Column
- Column Header · Command Palette · Comment · Comment Bubble · Comment Input
- Comment Thread · Complete Button · Compound Filter · Condition · Condition Builder
- Conditional Logic · Confetti · Confirmation · Confirmation Dialog · Confirmation Modal
- Contact List · Contacts · Content Block · Copy Button · Copy Link
- Cover · Cover Image · Crop Tool · Database Picker · Database Selector
- Date · Date & Time · Date Picker · Date Range · Detail View
- Dialog · Diff View · Discount · Divider · Document Editor
- Document History · Document Preview · Document Viewer · Drag & Drop · Drag & Drop Editor
- Drag Handle · Draw/Type/Upload · Drill-down · Drop Indicator · Dropdown
- Editor · Email · Email Composer · Email Input · Email Verification
- Embed URL · Emoji · Emoji Picker · Emoji Reaction · Envelope Mgmt
- Estimate · Event Log · Expiration · Export · Favorite
- Favorites · Feature Cards · Feature Info · Feedback Modal · Field
- Field Assignment · Field Mapping · Field Picker · File · File Picker
- File Upload · Filter · Filter Bar · Filter Tab · Floating Action Button
- Folder · Follow-up · Follow-up Question · Footer · Form
- Form Builder · Formula · Formula Editor · Function List · Gallery
- Gantt Chart · Gesture · Gradient · Grouping · Header Row
- Heading · Health Status Picker · Help & Misc · Hero Section · Highlight
- History · Home & Dashboard · IP Address · Icon · Icon Picker
- Identity Check · Illustration · Image · Image Block · Image Viewer
- Import Button · Initials · Inline Edit · Integration Card · Invite Input
- Invite Modal · Invoice History · Issue Selector · Italic · Kanban Board
- Keyboard · Keyboard Key · Keyboard Shortcut · Keyboard Shortcut Demo · Label
- Label Picker · Landing Page · Language Picker · Length · Line Graph
- Line Item · Link · Link Share · List · List Layout
- Loading · Loading Indicator · Lock · Logo · Logo Upload
- Magic Link · Markdown · Members · Members List · Mention
- Merge Field · Milestone List · Modal · Move Modal · Multi-Column Layout
- Multi-select · Multi-sort · Navigation · Navigation Bar · Nested Block
- Nested List · Nested Page · Nested Tree · Notification · Numbered List
- OAuth · OAuth Button · Operator · Operator Selector · Overlay
- Owner Picker · Page Heatmap · Page Indicator · Passkey · Passkey Icon
- Password · Paste · Payment Block · Payment Method · Permission
- Permission Matrix · Permission Picker · Permission Settings · Photo Library · Picker
- Plan Card · Plan Comparison · Plan Info · Plan Selector · Popover
- PowerForms · Preview · Pricing · Pricing Table · Priority
- Priority Picker · Private · Product Catalog · Profile Card · Progress
- Progress Bar · Progress Graph · Progress Indicator · Progress Steps · Property Columns
- Property Panel · Property Picker · Property Prefill · Property Reference · Property Type Picker
- Publish Toggle · Push Notification · QR Code · Quantity · Quote
- Radio Button · Rating · Reaction · Recent · Recent Pages
- Recent Searches · Recipient · Recipient Activity · Recipient Input · Recipient List
- Relation · Relation Config · Reminder · Reporting · Resize
- Resize Handle · Resolve Button · Restore Button · Rich Text · Rich Text Editor
- Role · Role Assignment · Role Picker · Rollup · Rollup Function
- Row · SEO Settings · SMS Code · SSO Button · Save Button
- Save Template · Save View · Search & Filtering · Search Bar · Segmentation
- Segmented Control · Send All Button · Sending · Sequential/Parallel Toggle · Settings
- Share · Share Link · Share Sheet · Side Navigation · Side Panel
- Sidebar · Signature Field · Signature Pad · Signing · Signing Order
- Slash Command · Slash Command Menu · Snooze · Snooze Action · Sort
- Sort Bar · Sort Header · Source Link · Source Selector · Splash Screen
- Stacked List · Star Rating · Stat Card · Stats Card · Status
- Status Badge · Status Configuration · Status Dot · Status Icon · Status Picker
- Status Update · Step · Strikethrough · Stripe/PayPal/ACH Picker · Sub-issues List
- Subtotal · Suggestion · Summary · Swipe · Swipe Action
- Switch · Sync Indicator · Sync Settings · Syntax Highlight · Tab
- Tab Bar · Table · Table Block · Table Options · Table View
- Tag · Tax · Team Selector · Teamspace · Template
- Template Button · Template Editor · Template Gallery · Template Picker · Templates
- Testimonial · Testimonials · Text Block · Text Field · Text Formatting
- Text Input · Theme Picker · Theme Preview · Thread · Thumbnail
- Thumbs Up/Down · Time Picker · Timeline · Timeline View · Timestamp
- Toggle · Token · Tone Picker · Tone Selector · Toolbar
- Tooltip · Top Navigation Bar · Tree · Trigger Picker · Unsplash
- Unsplash Picker · Upgrade Button · Upload · Usage Stats · Use Template Button
- Variable · Variable Mapping · Variable Picker · Verification Badge · Video
- Video Player · View Config · View Duration · View Switcher · Workflow Builder
- Workspace Join · Zoom


---

## 27. Appendix C: Mobbin-Confirmed Patterns (75 Flows)

These flows were verified from Mobbin.com search results and screen data:

| # | Platform | Flow Name | Screens | Category |
|---|----------|-----------|---------|----------|
| 1 | Airtable iOS | Onboarding | — | Onboarding |
| 2 | Airtable iOS | Home | — | Home |
| 3 | Airtable iOS | Creating a Kanban View | — | Adding & Creating |
| 4 | Asana iOS | Onboarding | — | Onboarding |
| 5 | Asana iOS | Onboarding (v2) | — | Onboarding |
| 6 | Asana iOS | Logging In | — | Logging In |
| 7 | Asana iOS | Moving Task to Another Section | — | Editing & Updating |
| 8 | Asana iOS | Marking Task as Milestone | — | Editing & Updating |
| 9 | Asana iOS | Marking Task as Approval | — | Editing & Updating |
| 10 | Asana iOS | Customizing Push Notifications | — | Settings & Preferences |
| 11 | Asana Web | Landing Page | — | Home |
| 12 | Asana Web | Admin Console | — | Settings & Preferences |
| 13 | Asana Web | Signing Up for a Demo | — | Signup |
| 14 | Asana Web | Enabling Two-Factor Authentication | — | Settings & Preferences |
| 15 | Asana Web | Adding an Emoji | — | Adding & Creating |
| 16 | Asana Web | Canceling a Subscription | — | Subscription & Paywall |
| 17 | Calendly Web | Onboarding | — | Onboarding |
| 18 | Calendly Web | Logging In | — | Logging In |
| 19 | Calendly Web | Event Types | — | Home |
| 20 | Calendly Web | Copying a Link | — | Copying & Duplicating |
| 21 | Calendly Web | Copying a Single-Use Link | — | Copying & Duplicating |
| 22 | Calendly Web | Sharing an Event Type | — | Sharing |
| 23 | Calendly Web | View Booking Page | — | Detail View |
| 24 | Calendly Web | Scheduling an Event | — | Booking & Reserving |
| 25 | Calendly Web | Event Type Detail | — | Detail View |
| 26 | Calendly Web | Renaming an Event Type | — | Editing & Updating |
| 27 | Calendly Web | Cloning an Event | — | Copying & Duplicating |
| 28 | Calendly Web | Editing Event Duration | — | Editing & Updating |
| 29 | Calendly Web | Editing an Internal Note | — | Editing & Updating |
| 30 | Calendly Web | Adding a Location | — | Adding & Creating |
| 31 | Calendly Web | One-Off Meeting | — | Adding & Creating |
| 32 | Calendly Web | Scheduling an Event (One-Off) | — | Booking & Reserving |
| 33 | Calendly Web | Sharing an Event | — | Sharing |
| 34 | Calendly Web | Creating a QR Code | — | Adding & Creating |
| 35 | Calendly Web | Scheduled Events | — | Home |
| 36 | Calendly Web | Rescheduling an Event | — | Editing & Updating |
| 37 | Calendly Web | Canceling an Event | — | Deleting & Removing |
| 38 | Calendly Web | Account | — | Settings & Preferences |
| 39 | Calendly Web | Account Link | — | Settings & Preferences |
| 40 | Calendly Web | Availability | — | Settings & Preferences |
| 41 | Calendly Web | Updating Working Hours | — | Editing & Updating |
| 42 | Calendly Web | Adding a Date Override | — | Adding & Creating |
| 43 | Calendly Web | Editing My Default Message | — | Editing & Updating |
| 44 | Calendly Web | Help and Support | — | Feature Info |
| 45 | Calendly Web | Notifications | — | Settings & Preferences |
| 46 | Calendly Web | Sending Feedback | — | Giving Feedback |
| 47 | Calendly Web | Logging Out | — | Logging Out |
| 48 | Linear iOS | Onboarding | 8 | Onboarding |
| 49 | Linear iOS | Switching to dark mode | 6 | Settings & Preferences |
| 50 | Linear Web | Onboarding | 26 | Onboarding |
| 51 | Linear Web | Logging in | 4 | Logging In |
| 52 | Linear Web | Landing page | 10 | Landing Page |
| 53 | Linear Web | Changelog | 4 | Feature Info |
| 54 | Linear Web | Linear 2022 Release | 9 | Feature Info |
| 55 | Notion iOS | Onboarding | 29 | Onboarding |
| 56 | Notion iOS | Logging in | 9 | Logging In |
| 57 | Notion iOS | Deleting an account | 4 | Deleting & Removing |
| 58 | Notion iOS | Adding a code block | 11 | Adding & Creating |
| 59 | Notion iOS | Adding a callout | 4 | Adding & Creating |
| 60 | Notion iOS | Replying a comment | 5 | Adding & Creating |
| 61 | Notion iOS | Deleting a comment | 3 | Deleting & Removing |
| 62 | Notion iOS | Adding new properties | 3 | Adding & Creating |
| 63 | Notion iOS | Changing search engine indexing | 5 | Settings & Preferences |
| 64 | Notion iOS | Turning page into wiki | 5 | Editing & Updating |
| 65 | Notion Web | Onboarding | 31 | Onboarding |
| 66 | Notion Web | Landing page | 14 | Landing Page |
| 67 | Notion Web | Creating a workspace | 15 | Adding & Creating |
| 68 | Notion Web | Logging out | 5 | Logging Out |
| 69 | Notion Web | Resetting password | 7 | Resetting Password |
| 70 | Notion Web | Creating a row header | 3 | Turning On/Off |
| 71 | Notion Web | Turning a page into a wiki | 11 | Editing & Updating |
| 72 | Notion Web | Rating an AI answer | 3 | Giving Feedback |
| 73 | PandaDoc Web | Onboarding | 12 | Onboarding |
| 74 | PandaDoc Web | Document editor | 7 | Editing & Updating |
| 75 | PandaDoc Web | License upgrade | 3 | Upgrading & Subscribing |


---

## Document Summary

| Metric | Value |
|--------|-------|
| **Total Platforms Analyzed** | 7 |
| **Total App Versions** | 13 (iOS + Web) |
| **Total Flows Cataloged** | 680 |
| **Total Screens** | 1147 |
| **Mobbin-Confirmed Flows** | 75 |
| **Unique UI Elements** | 422 |
| **SignOf Modules** | 8 |
| **Agent Types** | 8 |
| **Context Memory** | 1,000,000 tokens |
| **Components** | 47 |
| **Integrations** | 200+ |
| **Target Valuation** | $1,000,000,000,000 |

---

*SignOf™ — The Everything Platform*
*Confidential · February 2026 · v2.0*
