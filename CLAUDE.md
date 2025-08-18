# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Buildu Scotland Women's Empowerment Platform** - a web-based goal tracking and motivational platform supporting women in Buildu Scotland's employability programme. The platform helps users set SMART goals, track progress through milestones, and receive AI-powered coaching and motivation.

## Development Commands

### Frontend (Vite + React)
```bash
cd frontend-vite
npm run dev          # Start development server (usually localhost:5173+)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (Node.js + Express)
```bash
cd backend
npm run dev          # Start development server with nodemon (uses server-simple.ts)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled production server
```

## Critical Configuration Notes

### Tailwind CSS Configuration
- **IMPORTANT**: This project uses `package.json` with `"type": "module"` in frontend-vite
- Tailwind and PostCSS config files MUST use `.cjs` extension (not `.js`) to work properly
- Current files: `tailwind.config.cjs` and `postcss.config.cjs`
- Uses Tailwind CSS v3.4.17 (stable) - avoid v4 alpha versions

### Development Server Ports
- Frontend typically runs on localhost:5173, 5174, or 5175 (auto-increments if ports are busy)
- Backend runs on port 3001 (or PORT environment variable)

## Architecture Overview

### Frontend Architecture
- **Main App**: Single-page React app in `src/App.tsx` with state-driven navigation
- **Styling**: Tailwind CSS with custom purple-orange gradient theme, responsive design
- **UI Components**: Three main views - Dashboard (default), Goal Creation Form, AI Chat
- **Icons**: Lucide React icons throughout
- **State**: Local React state (useState) for modal/form management

### Backend Architecture
- **Current Server**: Uses `server-simple.ts` (simplified version without advanced routing)
- **API Structure**: RESTful endpoints with Express.js
- **Database**: PostgreSQL with comprehensive schema supporting users, goals, milestones, progress tracking, AI conversations
- **Security**: Helmet, CORS, rate limiting, Row Level Security (RLS) policies in database
- **Auth**: JWT-based authentication with Supabase integration planned

### Database Schema Structure
- **Core Tables**: users, goals, milestones, progress_updates
- **AI Features**: ai_conversations, ai_messages for chat functionality  
- **Gamification**: motivational_content, user_sessions for engagement tracking
- **SMART Goals**: Built-in support for Specific, Measurable, Achievable, Relevant, Time-bound criteria
- **Progress Calculation**: Automatic milestone completion triggers and progress percentage functions

### Type System
- Comprehensive TypeScript interfaces in `backend/src/types/index.ts`
- Covers all major entities: User, Goal, Milestone, ProgressUpdate, AIConversation, etc.
- API response types with pagination and error handling
- Authentication and request types for secure API interactions

## Key Design Patterns

### Goal Management Flow
1. Goals have categories (employment, skills, wellbeing, childcare, other) and priorities
2. Each goal can have multiple milestones with target dates and completion tracking
3. Progress updates link to goals/milestones and include mood tracking (1-5 scale)
4. Automatic milestone completion triggers when progress updates mark them complete

### AI Integration Strategy
- Conversation-based AI coaching with context awareness
- Multiple conversation types: goal_setting, motivation, problem_solving, celebration
- Cost-optimized approach using Hugging Face (free tier) with Claude Haiku fallback
- AI responses stored with metadata for usage tracking

### UI/UX Design System
- Purple (#9333ea) to orange (#f97316) gradient theme throughout
- Card-based layout with rounded corners and subtle shadows
- Progress visualization using SVG circles with gradient fills  
- Responsive design with mobile-first approach
- Achievement celebrations and motivational content integration

## Development Workflow

### When Working on Styling
- Always verify Tailwind config files have `.cjs` extension
- Custom colors defined in tailwind.config.cjs (purple and orange palettes)
- Custom CSS utilities in `src/index.css` for gradients and animations
- Google Fonts integration (Inter + Playfair Display) for typography

### When Working on Backend APIs
- Use the simplified server (`server-simple.ts`) for basic functionality
- Full server (`server.ts`) has more advanced routing but may have path-to-regexp compatibility issues
- All database operations should respect RLS policies and user context
- API responses follow standardized format with success/error structure

### Database Development
- Schema is in `backend/database/schema.sql` with comprehensive documentation
- Includes helpful views: `active_goals_with_progress`, `user_dashboard_stats`
- Database functions for automatic updates and progress calculations
- Row Level Security ensures users only access their own data

## Deployment Architecture

Designed for free-tier hosting:
- **Frontend**: Vercel (static deployment)
- **Backend**: Railway (Node.js hosting)
- **Database**: Supabase (PostgreSQL with auth)
- **AI Services**: Hugging Face Transformers (free tier)