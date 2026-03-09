# BabyTracker — Design & Development Guide

## Overview
A comprehensive infant care tracker (0-12 months) with feeding logs, sleep tracking, growth charts, milestone checklists, monthly summaries, education content, and AI advisor. Multi-file React app with Supabase backend + localStorage fallback.

**Tagline:** "Your Baby Care Companion"
**Brand color:** `#CC5B80` (fixed — wordmark always this color regardless of theme)
**Wordmark:** "Baby" (fontWeight 550) + "Tracker" (fontWeight 350), both `#CC5B80`

---

## File Structure
```
src/
  App.jsx           — Main app (all UI components, data, logic)
  Auth.jsx          — Supabase auth flow
  supabaseClient.js — Supabase client init
  useSupabase.js    — Database abstraction (CRUD for all tables)
  main.jsx          — Entry point
  index.css         — Global styles (minimal)
```

---

## Themes (3 Switchable)
```js
const themes = {
  pink: { pri:"#CC5B80", btn:"#d8809e", lt:"#fdf6f9", mid:"#e6a8be", dk:"#a84968",
          badge:"#faedf2", badgeTxt:"#a84968", learn:"#CC5B80", hover:"#fdf0f5", contBg:"#F9FAFB" },
  blue: { pri:"#6a9fd8", btn:"#8bb5e2", lt:"#f5f9fd", mid:"#bcd5ee", dk:"#4a7fb8",
          badge:"#e8f1fa", badgeTxt:"#4a7fb8", learn:"#6a9fd8", hover:"#eef5fc", contBg:"#F9FAFB" },
  sage: { pri:"#7fa87a", btn:"#99ba95", lt:"#f5f8f4", mid:"#c4d6c1", dk:"#5e8a58",
          badge:"#e8f0e6", badgeTxt:"#5e8a58", learn:"#7fa87a", hover:"#eef4ed", contBg:"#F9FAFB" }
};
```
- Theme persisted in profile (`profile.theme`)
- Theme color `t.pri` used for interactive elements (nav, buttons, accents)
- Brand color `#CC5B80` (BRAND constant) used only for wordmark — never changes

### Color Constants
```js
const BRAND = "#CC5B80";
const C = { h: "#333", body: "#444", sec: "#666", help: "#777" };
```

---

## Data Architecture

### Supabase Tables (6)
| Table | Key Columns |
|-------|------------|
| `profiles` | user_id, name, birth_date, gender, character (unused), theme |
| `feeds` | user_id, time, date, oz (text), brand, note |
| `night_sleep` | user_id, date, bed_time, wake_time, dur_mins, notes |
| `naps` | user_id, date, start_time, end_time, dur_mins, notes |
| `growth_entries` | user_id, date, weight_lbs, length_in, head_in |
| `milestone_checks` | user_id, month, item_index, checked_at |

### localStorage Keys (Fallback)
```js
const KEYS = {
  profile: "bt-profile", feeds: "bt-feeds", nightSleep: "bt-nightsleep",
  naps: "bt-naps", growth: "bt-growth", checks: "bt-checks"
};
```

### Profile Object
```js
{ name, birthDate, gender ("girl"/"boy"), theme ("pink"/"blue"/"sage") }
```

### Milestone Data (12 months)
Each month: `{ month, label, summary, categories[] }`
- Categories: Movement/Physical, Social/Emotional, Language/Communication, Cognitive
- Each category: `{ cat, items[] }` — items are checkbox strings
- Summaries use female pronouns by default → genderized via `genderize()` helper

### Education Data (5 topics)
Topics: Feeding & Nutrition, Sleep, Growth & Body, Development & Play, Grandparent Corner
Each: `{ id, title, icon, preview, articles[] }`
Articles: `{ t (title), content, table? }` — tables have headers + rows

### Resources Data (5 items)
External links: CDC, AAP, WHO — `{ name, desc, url }`

---

## Navigation Structure

### Nav Sections (4 items)
```js
const navSections = [
  { id: "tracker",    label: "Tracker",    icon: "tracker" },
  { id: "milestones", label: "Milestones", icon: "milestones" },
  { id: "summary",    label: "Summary",    icon: "summary" },
  { id: "resources",  label: "Resources",  icon: "education" }
];
```

### Desktop: Left Sidebar
- 220px width, sticky, borderRight
- NavIcon + label per section
- Active: `t.pri` color + 3px borderLeft
- Padding: `11px 13px 11px 16px` (balanced for borderLeft)

### Mobile: Bottom Nav Bar
- Class: `.btBottomBar`
- Icons: 22px, strokeWidth 2.4
- Labels: `.7rem`, weight 500/600
- Container: paddingTop 12, paddingBottom `calc(env(safe-area-inset-bottom) + 10px)`, paddingLeft/Right 12
- Buttons: height 50, padding `0 4px`, `space-evenly`

---

## Screens & Flows

### 1. Auth / Onboarding
- `Auth.jsx` handles Supabase auth
- Profile setup: baby name, birth date, gender, optional character
- Stored in Supabase `profiles` table + localStorage

### 2. Tracker Section
Vertical stack of tracking cards:

**a) Feeding Tracker**
- Log: time (TimeInput component), oz (numeric input), brand (text), note (text)
- Today's feeds list with running total
- AI evaluation of daily intake vs age-appropriate range

**b) Night Sleep**
- Log: bed time → wake time (TimeInput), auto-calculated duration
- AI evaluation vs WHO sleep recommendations by age

**c) Naps**
- Log: start → end time, auto-calculated duration
- Multiple naps per day, total + count shown
- AI evaluation vs age-appropriate nap ranges

**d) Growth**
- Log: weight (lbs), length (inches), head circumference (inches)
- WHO percentile calculation using reference data
- Growth history list

### 3. Milestones Section
- Age-aware: shows current month's milestones based on birth date
- Month selector (prev/next arrows)
- Checklist by category (4 categories × ~3 items each)
- Progress bar + AI evaluation text
- AI Deep Dive per milestone item (3-section format)

### 4. Summary Section (MonthlySummarySection)
- Month picker with prev/next arrows
- Stats cards: Days Tracked, Avg Intake/Day, Avg Sleep/Day
- Feeding & Sleep log table (date × feeding × night × naps × total)
- Growth measurements table
- Scrollable on mobile (min-width tables)

### 5. Resources Section
- Education topics: expandable article cards with AI Deep Dive
- External resources: linked cards to CDC, AAP, WHO

---

## Key Components

### NavIcon
`({ type, color, size, weight })` — SVG icons
- Types: tracker (clock), growth (heartbeat), milestones (checkbox), education (book), resources (link), summary (document), chat (speech bubble)
- Default: size 16, strokeWidth 2

### TimeInput
`({ h, m, ap, onH, onM, onAP })` — time entry with hour/minute fields + AM/PM toggle
- Hour: inputMode="numeric", max 12
- Minute: inputMode="numeric", max 59, padded
- AM/PM: toggle buttons

### Spinner
Loading indicator: spinning circle + "Looking into it..." text

### Pronoun System
```js
const pronounSets = {
  girl: { sub:"she", Sub:"She", obj:"her", pos:"her", ref:"herself" },
  boy:  { sub:"he",  Sub:"He",  obj:"him", pos:"his", ref:"himself" }
};
```
- `genderize(text, gender)` replaces female pronouns with male equivalents
- Milestone summaries authored in female → genderized at render time

---

## AI Integration

### Three AI System Prompts
1. **DEEP_DIVE_MS** (Milestones): "Where Baby Is Now" / "Activities to Encourage" / "When to Talk to Pediatrician"
2. **DEEP_DIVE_ED** (Education): "For Baby at This Age" / "Practical Tips" / "Good to Know"
3. **CHAT_SYS** (Ask Expert): "Based on [name]'s age ([age])," + concise guidance

### API
- `/api/chat` endpoint (server-proxied)
- Context: baby name, age, gender

### Sleep Evaluations (Built-in, No AI)
- `getSleepRec(ageMonths)` — returns recommended ranges by age
- `getNightEval()`, `getNapEval()` — natural language evaluations
- `getMilestoneEval()` — progress evaluation text
- `getPercentileLabel()` — WHO percentile from weight/length

---

## Helper Functions
- `calcAge(birthDate)` — returns { months, days, totalDays, label }
- `todayStr()` — "Monday, March 8, 2026" format
- `nowTimeStr()` — "3:45 PM" format
- `getCurrentTimeFields()` — { h, m, ap } for TimeInput defaults
- `timeFieldsToMinutes()` / `calcDurFromFields()` — time arithmetic
- `formatDurationExact(mins)` — "2 hrs 15 min" format

---

## Header Pattern
CSS grid: `gridTemplateColumns: "auto 1fr"`, `gridTemplateRows: "auto auto"`, columnGap 16, rowGap 4
- Left cell (merged): baby icon (26×26 pink circle + white pacifier SVG) + wordmark (#CC5B80) + tagline
- Right row 1: date + settings gear (34×34)
- Right row 2: "Ask Expert" link

**Key:** Wordmark always uses BRAND (#CC5B80), never theme color.

---

## Footer Pattern
Centered: 16px baby icon + "BabyTracker" (550/350, #CC5B80) + · + tagline (.68rem, #777)
Below: "Health & Wellness Innovations" (.68rem, #777, marginTop 10)

---

## Responsive Behavior
- Breakpoint: 768px
- Desktop: sidebar + content
- Mobile: bottom nav, tables scroll horizontally
- TimeInput fields: 52px width each
- Summary tables: min-width 540px for horizontal scroll

---

## Typography Constants
- Headings: `C.h` (#333)
- Body text: `C.body` (#444)
- Secondary: `C.sec` (#666)
- Helper/muted: `C.help` (#777)
- Tagline: `#777` (everywhere)
- Section labels: `.78rem`, fontWeight 700, uppercase, `t.pri`
- Content bg: `#F9FAFB`
- Card bg: `#fff`, shadow `0 2px 8px rgba(0,0,0,.04)` or `0 2px 6px rgba(0,0,0,.05)`
