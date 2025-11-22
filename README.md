# Native Dashboard

A modern, iOS-inspired dashboard built with Next.js, featuring refined minimalism and smooth animations.

## ✨ Features

- **iOS-Inspired Design** - Clean, minimal interface with iOS-style design patterns
- **Real-time Chat Stream** - Smooth streaming message animation with collapsible long messages
- **Metric Tiles** - Dynamic metric cards with trend indicators
- **Insight Cards** - Priority-based insight display with status indicators
- **Dark Mode** - Seamless light/dark theme switching
- **Responsive Layout** - Collapsible metric column for flexible viewing
- **Smooth Animations** - Framer Motion powered transitions and interactions

## 🛠 Tech Stack

- **Framework:** Next.js 15.1.4
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Theme:** next-themes

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
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout with theme provider
│   └── globals.css        # Global styles and CSS variables
├── components/
│   ├── chat-stream.tsx    # Chat interface with streaming
│   ├── dashboard-header.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── ui/                # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── insight-card.tsx
│       └── metric-tile.tsx
└── lib/
    ├── animations.ts      # Framer Motion variants
    ├── mock-data.ts       # Sample data
    └── utils.ts           # Utility functions
```

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

### Chat Stream
- Character-by-character streaming animation
- Collapsible long messages
- Timestamp display
- User/AI avatars
- Auto-scroll to latest message

### Metrics Dashboard
- Collapsible right column
- Real-time metric updates
- Trend indicators (up/down)
- Quick action buttons

### Responsive Design
- Mobile-first approach
- Adaptive grid layouts
- Touch-friendly interactions
- Minimal scrollbars

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
