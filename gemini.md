# Gemini Code Companion Guide

This document provides guidance for Gemini when working with the Buildu Scotland Women's Empowerment Platform codebase.

## 1. Project Overview

The project is a web-based goal-tracking and motivational platform designed to support women in Buildu Scotland's employability program. The platform enables users to set SMART goals, track their progress through milestones, and receive AI-powered coaching and motivation.

## 2. Core Technologies

*   **Frontend:** React 18 (TypeScript), Vite, Tailwind CSS, Headless UI, Framer Motion, Lucide React
*   **Backend:** Node.js, Express, TypeScript
*   **Database:** PostgreSQL
*   **Services:** Supabase (Auth and Database Hosting), Hugging Face Transformers, Claude Haiku

## 3. Development Environment

### Frontend (`frontend-vite`)

*   **Start Development Server:** `cd frontend-vite && npm run dev`
*   **Build for Production:** `cd frontend-vite && npm run build`
*   **Linting:** `cd frontend-vite && npm run lint`
*   **Preview Production Build:** `cd frontend-vite && npm run preview`

### Backend (`backend`)

*   **Start Development Server:** `cd backend && npm run dev`
*   **Build for Production:** `cd backend && npm run build`
*   **Start Production Server:** `cd backend && npm run start`

## 4. Architecture

### Frontend

*   **Framework:** Single-Page Application (SPA) built with React.
*   **Styling:** Tailwind CSS with a custom purple-to-orange gradient theme.
*   **State Management:** Primarily uses local React state (`useState`).
*   **Components:** The UI is organized into three main views: Dashboard, Goal Creation Form, and AI Chat.

### Backend

*   **Framework:** RESTful API built with Express.js.
*   **Server:** The development server uses `server-simple.ts`.
*   **Database:** PostgreSQL with a schema defined in `backend/database/schema.sql`.
*   **Security:** Implements Helmet, CORS, rate limiting, and Row Level Security (RLS) in the database.
*   **Authentication:** JWT-based authentication, with Supabase integration.

### Database

*   **Schema:** The database schema is located at `backend/database/schema.sql`.
*   **Tables:** Key tables include `users`, `goals`, `milestones`, `progress_updates`, `ai_conversations`, and `ai_messages`.
*   **Views:** Includes views like `active_goals_with_progress` and `user_dashboard_stats` for efficient data retrieval.
*   **Functions:** Utilizes database functions for automatic updates and progress calculations.

## 5. Key Concepts

### Goal Management

*   Goals are categorized (e.g., employment, skills, wellbeing).
*   Each goal can have multiple milestones with target dates.
*   Progress is tracked through updates linked to goals and milestones.

### AI Integration

*   The platform provides AI-powered coaching through a chat interface.
*   It uses a cost-optimized approach with Hugging Face Transformers and a Claude Haiku fallback.

## 6. Development Workflow

### Styling

*   Tailwind CSS configuration files use the `.cjs` extension.
*   Custom styles and gradients are defined in `tailwind.config.cjs` and `src/index.css`.

### Backend APIs

*   The simplified server (`server-simple.ts`) is used for development.
*   API responses follow a standardized success/error format.

### Database

*   The database schema is documented in `backend/database/schema.sql`.
*   RLS policies ensure data privacy.

## 7. Deployment

*   **Frontend:** Vercel
*   **Backend:** Railway
*   **Database:** Supabase

## FAQ

### How do I spin up a UI preview?

To spin up the UI development server, you'll need to navigate to the `frontend-vite` directory and run the `dev` script. This will start a local development server, typically accessible in your browser at `http://localhost:5173` (or a similar port). You can use the command: `cd frontend-vite && npm run dev &`. If you want to preview a production build of the UI, you would first need to build it using `npm run build` and then run `npm run preview`.