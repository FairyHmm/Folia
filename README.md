# Folia

CV scanner and personalised skill graph.

## Getting Started

### Prerequisites
- [pnpm](https://pnpm.io/installation)
- Node.js (v18+)

### Install
```bash
pnpm install
```

### Run the app
```bash
pnpm dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build
```bash
pnpm build
```

## Project Structure

```
.
├── api/                # API routes and server logic
├── public/             # Static files
├── src/                # Source code
│   ├── app/            # Main app files
│   │   ├── styles/     # Global styles and theme
│   │   ├── App.jsx     # Root component
│   │   └── main.jsx    # Entry point
│   ├── features/       # Feature modules
│   │   ├── auth/       # Authentication
│   │   ├── chat/       # Chat functionality
│   │   ├── graph/      # Graph visualization
│   │   └── upload/     # File upload
│   └── shared/         # Shared code
│       ├── assets/     # Static assets
│       ├── components/ # Reusable components
│       ├── data/       # Static data
│       ├── hooks/      # Custom hooks
│       ├── store/      # State management
│       ├── styles/     # Shared styles
│       └── utils/      # Utility functions
├── index.html          # HTML entry point
├── vercel.json         # Vercel configuration
├── vite.config.js      # Vite configuration
├── package.json
└── pnpm-lock.yaml
```

---
