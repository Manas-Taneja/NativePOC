# Native Dashboard

A modern, iOS-inspired dashboard built with Next.js, featuring refined minimalism and smooth animations.

## ✨ Features

- **iOS-Inspired Design** - Clean, minimal interface with iOS-style design patterns
- **Real-time Chat Stream** - Smooth streaming message animation with collapsible long messages
- **Workspace Sidebar** - Channel + member list mirrored from the NativeIQ Nuxt app
- **Insight & KPI Panels** - Pulls from shared `@native/types` + `@native/ui` packages
- **Next.js Route Handlers** - `/api/chat`, `/api/insights`, `/api/tasks`, `/api/policy/check`
- **Dark Mode** - Seamless light/dark theme switching
- **Smooth Animations** - Framer Motion powered transitions and interactions

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Theme:** next-themes
- **LLM:** OpenAI Responses API (via `openai` SDK)
- **Packages:** npm workspaces (`packages/types`, `packages/ui`, `packages/utils`)

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
├── app/
│   ├── api/               # Next route handlers (chat, insights, tasks, policy)
│   └── (pages + layout + globals)
├── components/
│   ├── channel-sidebar.tsx
│   ├── sections/          # Signal ticker, business insights, etc.
│   └── ui/                # Local wrappers around design-system primitives
├── lib/
│   ├── mock-data.ts       # Sample data + shared mock channels/members
│   └── server-data.ts     # Backend seed used by API routes
└── packages/              # npm workspaces lifted from NativeIQ
    ├── types/             # `@native/types`
    ├── ui/                # `@native/ui` (React components + CSS tokens)
    └── utils/             # `@native/utils` (formatters/helpers)

```

## 🔌 API Routes

All handlers live under `app/api` and mirror the Nuxt server endpoints:

| Route | Method | Description |
| --- | --- | --- |
| `/api/chat` | POST | Calls OpenAI (`gpt-4o`) with history + system prompt. Requires `OPENAI_API_KEY`. |
| `/api/insights` | GET | Returns insight objects filtered by `type`, `impact`, or `team`. |
| `/api/tasks` | GET | Filters mock tasks by `assignee` or `state`. |
| `/api/tasks/from-thread` | POST | Creates a placeholder task from a Slack thread payload. |
| `/api/policy/check` | POST | Simulated policy decision envelope (`allow`, `policy_id`, `rationale`). |

## 🔐 Environment

Create `.env.local` in the `NativePOC` directory with:

```
OPENAI_API_KEY=sk-your-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** If you're migrating from NativeIQ, the code also supports the old variable names (`SUPABASE_URL` and `SUPABASE_KEY`) for compatibility. You can copy your `.env` file from NativeIQ and it will work.

The Supabase keys enable realtime chat channels; the OpenAI key powers `/api/chat` and the assistant responses. Restart `npm run dev` after updating env vars.

## 🎨 Design System

### Color Palette
- **Accent:** iOS Blue (#3b82f6)
- **Backgrounds:** Layered grays with subtle elevation
- **Typography:** Barlow font family

### Components
- **Cards:** Multiple variants (default, interactive, accent)
- **Buttons:** 4 variants (primary, secondary, outline, ghost) × 3 sizes
- **Metric Tiles:** Animated trend indicators
- **Insight Cards:** Priority-based styling (high, medium, low)

### Animations
- Stagger animations for lists
- Smooth slide and fade transitions
- Micro-interactions on hover and click

## 🌓 Theme Support

The app supports both light and dark modes with:
- Automatic system preference detection
- Manual toggle via header button
- Persistent theme selection
- Smooth transitions between themes

## 📝 Key Features

### Chat + Channels
- Character-by-character streaming animation
- Collapsible long messages and loader state
- Channel sidebar with AI + team channels and members
- Auto-scroll to latest message

### Metrics & Insights
- Collapsible right column
- Reuses `@native/ui` MetricTile + InsightCard components
- Signal ticker mixing SLA deltas + insight headlines
- Quick actions module

## 🔧 Configuration

Customize theme colors in `app/globals.css`:
```css
:root {
  --color-accent: #3b82f6;
  --color-bg-base: #ffffff;
  /* ...more variables */
}
```

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Built with ❤️ using Next.js and Framer Motion
