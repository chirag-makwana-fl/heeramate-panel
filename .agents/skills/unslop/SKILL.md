---
name: unslop
description: >-
  Audit and transform generic AI-generated ("vibecoded") frontend interfaces into
  intentional, domain-authentic, human-crafted UIs. Eliminates AI slop tells
  (random gradients, floating glow blobs, badge spam, generic SaaS defaults)
  through a structured Audit, 5-point Creative Direction, and 9 sequential passes.
---

# Unslop UI Skill

Transform generic, AI-generated interfaces into intentional, domain-authentic product UIs without losing existing features, content, or functionality.

## Phase 1: The Audit
Scan the target screen or component and inventory all "AI Slop" tells before touching any code:
- **Color & Gradient Clutter**: Unmotivated `bg-gradient-to-*`, purple/indigo/cyan neon glows (`shadow-cyan-500/25`), or multi-accent rainbow badges.
- **Decoration Crutches**: Floating background blur blobs (`blur-3xl`), unnecessary `animate-pulse` on static badges, hairline box-in-box nesting, and heavy drop shadows.
- **Typography Defaults**: Generic system fonts without proper hierarchy, missing `tabular-nums` on financial/metric figures, or overused `tracking-wider uppercase` micro-labels on everything.
- **Copy & Emoji Spam**: Shouty SaaS marketing copy, emojis baked into data labels or tabs, and redundant helper subtitles.
- **Layout & Density**: Over-padded card soup that hides real operational data, or inconsistent border/surface contrast.

## Phase 2: Creative Direction (5-Line Definition)
Before rewriting code, define the product's authentic visual direction:
1. **Product**: What this tool actually is (e.g., *HeeraMate — operational ledger & workforce console for Surat diamond polishing artisans*).
2. **Character**: Honest, crisp, grounded, high-density, utilitarian—like a precision workshop ledger paired with modern financial clarity.
3. **World**: Polished stone, warm paper/slate surfaces, crisp ink, and surgical precision.
4. **Moments**: Concentrate visual emphasis on real data—daily diamond counts, ₹ wage tallies, Upad balances, and interactive trend charts—while keeping chrome quiet.
5. **Signature**: Sharp tabular numerals (`tabular-nums`), hairline 1px structural dividers, and a restrained diamond-cutter indigo/slate palette with purposeful status semantics.

## Phase 3: The Nine Ordered Passes
Execute each pass systematically across the target component or screen:
1. **Spacing**: Tighten excessive padding into clean, consistent rhythmic scales (`4px / 8px / 12px / 16px / 24px`). Remove redundant wrapper gaps.
2. **Color**: Strip unmotivated gradients and neon shadows. Establish a disciplined surface/border/ink hierarchy (neutral slate/zinc surfaces with one crisp primary accent and clean semantic status colors).
3. **Icons**: Remove decorative emojis from UI chrome and tabs; use consistent stroke-weight `lucide-react` icons only where they aid scanning.
4. **Copy**: Replace generic/shouty AI copy with concise, grounded, operational language.
5. **Typography**: Enforce clear contrast between display headings, section headers, body text, and metadata. Apply `tabular-nums` to all numbers, dates, currencies (`₹`), and counts.
6. **Layout**: Replace "card soup" with clean structural grids, crisp table dividers, and scannable alignment.
7. **Details**: Refine border colors (`border-slate-200/80` / `border-slate-800/80`), clean focus rings, and consistent border radii.
8. **Visuals**: Ensure charts, progress bars, and data tables feel crisp, interactive, and grounded—never static placeholders.
9. **Motion**: Remove distracting `animate-pulse` on badges or heavy scale zooms; keep transitions subtle (`150ms` ease) for hover/focus states.
