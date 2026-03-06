# Baby Tracker — Claude Code Context

## Workflow Rules
- Never ask for permission or confirmation. Proceed with all fixes, builds, and iterations automatically.
- After successful build, push to git.

## Project Overview
Baby health and development tracker with feeding logs, growth charts, milestone tracking, educational content, and AI-powered parenting assistant. Includes authentication flow.

## Architecture
Two-file React app:
- `src/App.jsx` (950 lines) — main application with all views and logic
- `src/Auth.jsx` — login/signup authentication component

### Key Data Structures
- `themes` — 3 color themes: pink, blue, sage (each with full token set)
- WHO growth data — weight/length percentiles for boys and girls (0-12 months)
- Feeding types, milestone categories, educational content sections

### Features / Views
- **Tracker** — daily feeding log (breast, bottle, solids) with time tracking
- **Growth** — weight/length charts plotted against WHO percentile curves
- **Milestones** — developmental milestone checklist by category
- **Education** — parenting tips and guidance content
- **Resources** — curated links and references
- **Summary** — daily/weekly overview
- **Chat** — AI parenting assistant

### Navigation
- Bottom tab bar with SVG icons (NavIcon component)
- 7 views: tracker, growth, milestones, education, resources, summary, chat

## Tech Stack
- React + Vite + Tailwind
- No external chart libraries — custom SVG growth charts
- Brand color: `#237a82`
- `staticwebapp.config.json` for Azure Static Web Apps deployment

## Design Standards
- Muted theme system (pink/blue/sage) — user-selectable
- Font weights 400-600 only
- Clean card-based layout with subtle shadows
- Consistent padding and spacing
- Mobile-first responsive design
