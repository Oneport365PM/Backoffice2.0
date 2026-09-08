# OnePort 365 — Design System

Source of truth for every build in this repo. Extracted from the OnePort 365
design system reference (`OnePort_365_Design_System_standalone3_1.html`,
provided by Nkechi). Apply this to all new screens and components — do not
invent new colors, fonts, or component patterns outside what's below.

Tokens are also available as CSS custom properties in [`tokens.css`](./tokens.css)
— `@import` or copy that file into any build rather than re-typing hex values.

## Brand thesis

> Deep green for trust. Electric lime for motion.

Dark Green is the anchor — navigation, primary structure, trust, calm across
long sessions. Accent Lime means "go" — track, ship, confirm, the one
selected/primary action per view. Gold flags value and money. **Keep the lime
rare**: one primary action per view. Spread it everywhere and the system
reads louder, not faster.

## 01 Colour

| Name | Hex | Usage |
|---|---|---|
| Dark Green | `#023819` | Primary/structure, nav, primary text on light, dark surfaces |
| Light Green | `#D1DBBD` | Calm secondary surfaces, secondary chips |
| Accent Green (Lime) | `#BFFB4F` | The one primary action per view — "go" |
| Gold | `#FFCC1A` | Value, rates, money — also used as Warning |
| White | `#FFFFFF` | Card surfaces |
| Cream (page bg) | `#FDFBF1` | Page background ("Text Dark Section") |
| Light Silver | `#808080` | Secondary/muted text |
| Dark Silver | `#383838` | Body text |
| Error | `#FF1A1A` | **Strictly** overdue / missing / failed — never decorative |
| Success | `#1F8A5B` | Quote ready, won, active (distinct hue from Accent Lime) |

**Hard rule: no blue, purple, orange, or teal anywhere in the product.**
Every status, stage, tier, chart series, and avatar draws from this palette.
Red is reserved strictly for error/overdue — never used decoratively.

Categorical series (charts, stages, 6 steps):
`#023819` → `#2F7A3F` → `#7FAE2E` → `#BFFB4F` → `#FFCC1A` → `#D1DBBD`

Standard borders/dividers are tinted from Dark Green, not flat grey:
card border `rgba(2,56,25,.12)`, internal row divider `rgba(2,56,25,.07)`,
unfocused input border `rgba(2,56,25,.35)`.

Each color has a black→tone→white tonal ramp (12 steps) for hover, borders,
tints and disabled states — always derive from the family, never a new hue.
See `tokens.css` for the Dark Green and Accent Green ramps used in this repo.

### Semantic chip pairs (background / text)

| Meaning | Background | Text | Dot / icon color |
|---|---|---|---|
| Neutral / New | `#EDEFE8` | `#4a5a3f` or `#023819` | `#808080` |
| Success / Responded / Captured | `#E1F1E8` | `#0f7a45` | `#1F8A5B` |
| Warning / Awaiting / Info needed | `#FFF3CC` | `#8a6a00` | `#FFCC1A` |
| Primary / Quote ready | `#BFFB4F` | `#023819` | `#023819` |
| Error / Overdue | `#FDE0E0` | `#cc1414` | `#FF1A1A` |
| Enterprise tier | `#023819` | `#BFFB4F` | — |
| Mode chip (Ocean/Air Freight) | `#D1DBBD` | `#023819` | — |

Readiness scale (0–10): **0–3 low** → Error red · **4–6 building** → Warning
gold · **7–10 ready** → Success green.

## 02 Typography

- **Poppins** (weights 400/600/700) — display, headings, key figures. Geometric, confident.
- **Open Sans** (weights 400/500/700) — body, UI labels, dense data. Neutral, legible at small sizes.

| Role | Size | Weight/family |
|---|---|---|
| Display | 48px | Poppins 600, line-height 1.02–1.04, letter-spacing -.02em |
| H1 | 32px | Poppins 600, letter-spacing -.015em |
| H2 | 24px | Poppins 600 |
| H3 | 18px | Poppins 600 |
| Body | 15px | Open Sans 400, line-height 1.55 |
| Label | 11px | Open Sans 700, uppercase, letter-spacing .09em |
| Section eyebrow (card kicker) | 11px | Open Sans 700, uppercase, letter-spacing .1em, color `#808080` |
| Section number (e.g. "01") | 18px | Poppins, color `#2f6b1e` |

Numerals are tabular (`font-variant-numeric: tabular-nums`) wherever figures line up.

## 03 Space, radius & elevation

**Spacing** — 4px base: `space-1`=4, `space-2`=8, `space-3`=12, `space-4`=16, `space-6`=24, `space-8`=40, `space-10`=64.

**Radius**: `sm`=6 (small chips) · `md`=8 (inputs, buttons, tabs) · `lg`=12 (nested/inner cards) · `xl`=16 (outer panel cards) · `full`=999 (pills).

**Elevation** (soft green-tinted shadows, never flat grey):
- `e1` rest: `0 1px 2px rgba(2,56,25,.05), 0 1px 3px rgba(2,56,25,.04)`
- `e2` raised card: `0 2px 4px rgba(2,56,25,.05), 0 8px 20px -8px rgba(2,56,25,.14)`
- `e3` hover/modal: `0 4px 8px rgba(2,56,25,.06), 0 18px 40px -16px rgba(2,56,25,.22)`
- `e-hero` dark feature: `0 20px 45px -22px rgba(2,56,25,.8)` (on `#023819` bg, `#FDFBF1` text)

## 04 Buttons

Four roles only. Font: Poppins 600, 14px. Radius `md` (8px). Padding `13px 18px`.

| Role | Background | Text | Hover |
|---|---|---|---|
| Accent (the primary action) | `#BFFB4F` | `#023819` | bg `#a9e83a` |
| Solid | `#023819` | `#BFFB4F` | bg `#03571f` |
| Outline | `#fff`, border 1.5px `#023819` | `#023819` | invert: bg `#023819`, text `#BFFB4F` |
| Disabled | `#8FA08C` | `#FDFBF1` | cursor: not-allowed, no hover |

Tabs/filter chips: selected — bg `#BFFB4F` text `#023819` (or `#D1DBBD`/`#023819` as a secondary-selected variant); unselected — `#fff` bg, border 1.5px `#023819`, text `#023819`. Poppins 600 13px, padding `8px 22px`, radius `md`.

Text links: Open Sans 700 14px, color `#023819`, `border-bottom: 1.5px solid #023819`.

## 05 Selection controls

Checkbox: 22×22px, radius 5px. Radio: 22×22px, circular. **Selected is always lime** (`#BFFB4F` fill with `#023819` check/dot) regardless of surface (dark green / light green / white). Unselected stays outlined in the surface's ink color.

## 06 Inputs — the floating notched label

Single anatomy for text, textarea, phone, dropdown, password:

- Wrapper: `position:relative`, border `1.5px solid rgba(2,56,25,.35)`, radius `md` (8px), padding `15px 14px`.
- Notch label: absolutely positioned `top:-8px; left:11px`, background matches the surface behind it (`#fff` on light, `#023819` on dark), `padding:0 5px`, `font-size:11px`, color `#808080` at rest.
- **Hover**: border `1.5px solid #023819`; notch color `#023819`.
- **Active/focus**: border `2px solid #023819` **plus** `box-shadow: 0 0 0 3px rgba(191,251,79,.4)` (lime focus ring); notch color `#023819`.
- **Error**: border `2px solid #FF1A1A`; notch + text color `#FF1A1A`; helper text below in `#FF1A1A`, 11.5px.
- **On dark surface** (`#023819` bg): border `rgba(253,251,241,.4)`, text `#FDFBF1`, notch bg `#023819`; active border `#BFFB4F`; error text/notch `#FF6B6B` (lighter red for contrast on dark).

## 07 Search bars

Two patterns, both on the Light Green (`#D1DBBD`) calm surface: a **track-number** lookup field, and a **FAQ search** with a live-suggestions panel on a darker Light-Green tint (`#c3cfa9`).

## 08 Avatars & owner chips

Monogram avatars cycle through **4 deterministic brand fills** — assign by hashing the person's name so the same person always gets the same color. Never random blue/teal/purple.

1. bg `#023819` / text `#BFFB4F`
2. bg `#BFFB4F` / text `#023819`
3. bg `#D1DBBD` / text `#023819`
4. bg `#FFCC1A` / text `#023819`

Shape: rounded-square ("squircle"), not circular. Radius scales with size (~12px at 46px, ~9px at 34px, 16px at 62px).

Owner chip: bg `#F4F6EF`, border `1px solid rgba(2,56,25,.1)`, radius `lg` (10px), padding `9px 12px`; name Open Sans 700 14px `#023819`; role/subtitle 12px `#808080`.

## 09 Pipeline & list rows

Stage headers number in a single ink circle (`#023819` bg, white number) — never five different colors. The one place hue varies is a thin accent bar underneath, drawn from the categorical set. Deal cards and list rows compose the chips, avatars and readiness scores defined above.

## Things currently off-system (fix on sight)

The audit in the source doc calls out drift to correct wherever found: RFQ funnel bars in blue/purple/orange, pipeline stage badges in red/purple/orange, tier chips in blue/purple, owner avatars in blue/teal/purple, blue metric numbers. Remap all of these to the palette above.

## Fonts — loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Open+Sans:wght@400;500;700&display=swap" />
```

## Notes for future builds

- This is a **single light theme** (cream `#FDFBF1` page background, white card surfaces) — the source system defines no OS dark-mode variant, only an explicit "on dark surface" component variant (`#023819` bg) used deliberately for specific dark panels. Don't retrofit a dark theme; use the dark-surface component variant where the design calls for a dark panel.
- Every new status/tag/chip must map to one of the semantic pairs above — don't invent new hues.
- Every new avatar must use the deterministic 4-fill cycle, not a random or per-developer color choice.
