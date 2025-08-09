# Average Joe's Takeoffs

A professional roofing contractor application built with React, TypeScript, and Tailwind CSS.

## Features

- **Responsive Design**: Optimized for both desktop and mobile devices
- **Desktop Navigation**: Fixed left sidebar with navigation items
- **Mobile Navigation**: Header bar with bottom navigation
- **Professional Styling**: Contractor-focused design with gradient hero section
- **Type Safety**: Built with TypeScript for better development experience
- **Modern Tech Stack**: Vite, React Router DOM, Lucide React icons

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Development**: Hot Module Replacement (HMR) enabled

## Getting Started

### Prerequisites

- Node.js (version 20.9.0 or compatible)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd average-joes-takeoffs
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build the application for production
- `npm run preview` - Preview the built application locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Sidebar.tsx     # Desktop navigation sidebar
│   ├── MobileHeader.tsx # Mobile header component
│   └── MobileNavigation.tsx # Mobile bottom navigation
├── pages/              # Page components
│   ├── Home.tsx        # Homepage with hero and recent activity
│   ├── Profile.tsx     # Contractor profile page
│   ├── Customers.tsx   # Customer management
│   ├── Distributors.tsx # Distributor management
│   ├── Insurance.tsx   # Insurance management
│   └── Takeoffs.tsx    # Takeoff management
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types and interfaces
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## Navigation Structure

### Desktop (Sidebar)
- Home
- Contractor Profile
- Customers
- Distributors
- Insurance
- Takeoffs

### Mobile (Bottom Navigation)
- Home
- Profile
- Customers
- Takeoffs

## Responsive Breakpoints

- **Mobile**: Default (< 768px)
- **Desktop**: md breakpoint and above (≥ 768px)

## Development Notes

- The application uses Tailwind CSS for styling with a custom color scheme suitable for contractor businesses
- Navigation active states are managed through React Router's `useLocation` hook
- Components are fully typed with TypeScript interfaces
- The layout automatically adapts between desktop sidebar and mobile bottom navigation

## Future Enhancements

- User authentication and authorization
- Real project data integration
- Advanced takeoff calculation features
- Customer and distributor management systems
- Insurance tracking and reporting
- Data export functionality

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
