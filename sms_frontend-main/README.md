# SMS Gateway Frontend

A modern React-based web application for managing SMS operations, built with Vite, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 19** - UI library
- **TypeScript 6** - Type safety
- **Vite 8** - Build tool and dev server
- **React Router 7** - Client-side routing
- **TanStack Query** - Data fetching and state management
- **Tailwind CSS 4** - Utility-first styling
- **Oxlint** - Fast linting
- **Prettier** - Code formatting

## Features

- **Authentication** - Secure user login and registration
- **Apps Management** - Create and manage applications with API keys
- **SMS Sending** - Send SMS messages through integrated providers
- **Wallet Management** - Track and manage credit balance
- **Sender IDs** - Configure sender identities
- **Pricing Plans** - View and manage pricing tiers
- **User Management** - Handle user accounts and permissions
- **Provider Integration** - Connect to SMS service providers
- **Super Admin** - Advanced administrative controls

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (see backend README)

### Installation

```bash
# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Type check
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

## Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## Project Structure

```
src/
├── app/              # Core application setup
│   ├── dashboard/    # Dashboard layouts
│   ├── landing/      # Landing pages
│   └── router.tsx    # Route configuration
├── features/         # Feature modules
│   ├── auth/         # Authentication
│   ├── apps/         # App management
│   ├── wallet/       # Wallet operations
│   ├── pricing/      # Pricing plans
│   ├── sender-ids/   # Sender ID management
│   ├── providers/    # SMS providers
│   └── users/        # User management
└── shared/           # Shared resources
    ├── api/          # API client
    ├── hooks/        # React hooks
    ├── lib/          # Utilities
    └── ui/           # UI components
```

## Contributing

1. Follow the TypeScript strict mode guidelines
2. Run linting and formatting before commits
3. Keep components small and focused
4. Use feature-based organization

## License

Private project
