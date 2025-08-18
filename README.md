# Buildu Scotland Women's Empowerment Platform

A web-based goal tracking and motivational platform supporting women in Buildu Scotland's employability programme.

## Project Structure

```
buildu-scotland-platform/
├── frontend/          # React TypeScript frontend
├── backend/           # Node.js Express API server
├── shared/            # Shared types and utilities
├── docs/              # Project documentation
└── README.md          # This file
```

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Headless UI for accessible components
- Framer Motion for animations
- Lucide React for icons

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Supabase for auth and database hosting

### AI Integration
- Hugging Face Transformers (free tier)
- Claude Haiku (cost-optimized fallback)
- Custom prompt library for efficiency

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (or Supabase account)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. Set up environment variables (see `.env.example` files)
4. Run development servers

## Development

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && npm run dev`

## Deployment

The application is designed to run on free tiers:
- Frontend: Vercel
- Backend: Railway
- Database: Supabase

## Contributing

This project is part of Scottish Tech Army's volunteer programme. See CONTRIBUTING.md for guidelines.

## License

MIT License - see LICENSE file for details.