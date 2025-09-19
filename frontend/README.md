# Expense Tracker Frontend

A modern React TypeScript frontend application for tracking shared expenses with friends and family.

## Features

- **User Authentication**: Secure login/signup with JWT tokens
- **Group Management**: Create and manage expense groups
- **Expense Tracking**: Add, edit, and delete expenses
- **Balance Calculation**: See who owes what in each group
- **Responsive Design**: Works on desktop and mobile devices
- **Type Safety**: Full TypeScript support with strict typing

## Tech Stack

- **React 19** with TypeScript
- **Material-UI** for components
- **Tailwind CSS** for styling
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Axios** for API calls

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on http://0.0.0.0:8000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout/         # Layout components (Header, Layout)
├── contexts/           # React contexts (AuthContext)
├── hooks/              # Custom hooks (useApi)
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## API Integration

The frontend integrates with the backend API through:

- **Authentication**: JWT-based auth with automatic token refresh
- **Groups**: CRUD operations for expense groups
- **Expenses**: Full expense management with categories and metadata
- **Users**: Profile management and user lookup

## Features Overview

### Authentication
- Secure login/signup forms
- JWT token management
- Protected routes
- Automatic logout on token expiry

### Group Management
- Create and manage groups
- Add/remove members
- View group statistics
- Group-based expense filtering

### Expense Tracking
- Add expenses with amount, description, and category
- Edit and delete expenses
- Filter by group
- Recent expenses overview

### Balance Calculation
- Real-time balance calculations
- Individual member balances
- Equal share calculations
- Net balance summaries

## Development

### Code Style
- TypeScript strict mode enabled
- ESLint configuration
- Prettier for code formatting
- Material-UI design system

### State Management
- React Query for server state
- React Context for global state (auth)
- Local state with useState/useReducer

### Styling
- Material-UI components
- Tailwind CSS for utility classes
- Responsive design principles
- Dark/light theme support

## Deployment

The app can be built for production using:

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Contributing

1. Follow the existing code style
2. Add TypeScript types for all new features
3. Write tests for new components
4. Update documentation as needed