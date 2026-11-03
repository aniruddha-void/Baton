# Baton — AI Project Knowledge Handover Platform

Baton is an AI-powered project knowledge handover platform that streamlines context transfer, documentation, tasks, and architectural insights across engineering and product teams.

---

## Project Structure

```text
Baton/
├── Baton-UI/                   # Visual source of truth (UI reference screenshots)
├── frontend/                   # Dedicated React + Vite frontend application
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Brand assets (including official baton-logo.png)
│   │   ├── components/
│   │   │   ├── common/         # Shared global components (BatonLogo, etc.)
│   │   │   ├── ui/             # Reusable atomic UI elements (Buttons, Badges, Cards)
│   │   │   └── sections/       # Composite layout blocks & page sections
│   │   ├── layouts/            # Application shells (AppLayout, Sidebar, Header)
│   │   ├── pages/
│   │   │   ├── landing/        # Landing & marketing screens
│   │   │   ├── auth/           # Login, signup, password recovery
│   │   │   └── app/            # Core dashboard & feature screens
│   │   ├── routes/             # React Router route registry (AppRoutes.jsx)
│   │   ├── services/           # API and service integrations
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Helper utilities and formatters
│   │   ├── styles/             # Design tokens and global CSS
│   │   ├── App.jsx             # Top-level application component
│   │   └── main.jsx            # React 18 client entry point
│   ├── index.html              # HTML template with typography configuration
│   ├── package.json            # Frontend dependencies and scripts
│   ├── package-lock.json       # Dependency lockfile
│   └── vite.config.js          # Vite build configuration
├── .gitignore                  # Git ignore rules
└── README.md                   # Project overview & documentation
```

---

## Frontend Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+) & JSX
- **Styling**: Pure CSS with design tokens (`variables.css` & `global.css`)
- **Routing**: React Router v6
- **Icons**: Lucide React

---

## Getting Started

To run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at:
- **Local**: `http://localhost:5173/`

