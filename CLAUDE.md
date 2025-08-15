# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vietnam Offshore Development Platform - A B2B marketplace connecting companies with Vietnamese offshore development teams. Built with Next.js 15, React 19, TypeScript, and Supabase.

## Essential Commands

```bash
# Install dependencies (use pnpm)
pnpm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server  
npm run start

# Run linter
npm run lint
```

## Environment Variables Required

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GEMINI_API_KEY=
```

## Architecture Overview

### Authentication & State Management
- **Auth Context** (`lib/auth-context.tsx`): Client-side auth state management using React Context. Handles user sessions, role-based access (buyer/vendor/admin), and guest login functionality. Auth data persists in localStorage.
- **Supabase Integration** (`lib/supabase.ts`): Optional backend integration. The app gracefully handles cases where Supabase is not configured, falling back to mock data and local state.

### Routing Structure (App Router)
- `/` - Landing page with role-based redirects
- `/search` - Company search with filters (tech stack, location, price)
- `/company/[id]` - Company profiles and reviews
- `/contact/chat` - Real-time messaging interface
- `/admin` - Admin dashboard (role-restricted)
- `/profile/manage` - User profile management
- `/messages`, `/notifications` - User communication features

### Key Design Patterns

1. **Graceful Degradation**: The app works without backend services. Check `isSupabaseAvailable()` before Supabase operations.

2. **Role-Based Access**: Three user roles (buyer/vendor/admin) with automatic routing based on role in `app/page.tsx`.

3. **Component Organization**:
   - `/components/ui/` - Radix UI primitives wrapped with Tailwind styling
   - Feature-specific components organized by domain (auth, chat, reviews, etc.)
   - All UI components use shadcn/ui patterns with `cn()` utility for styling

4. **AI Integration**: Gemini AI chatbot (`components/chatbot/floating-chatbot.tsx`) provides customer support. API key required but optional.

5. **Form Handling**: React Hook Form + Zod for validation throughout the app.

## Development Notes

- **TypeScript**: Strict mode enabled but build errors ignored in `next.config.mjs`
- **ESLint**: Configured but ignored during builds
- **Styling**: Tailwind CSS v4 with CSS-in-JS approach
- **Package Manager**: Uses pnpm (lockfile: `pnpm-lock.yaml`)
- **Path Alias**: `@/` maps to project root

## Common Tasks

### Adding New Pages
1. Create route in `/app` directory
2. Implement auth guards if needed using `useAuth()` hook
3. Follow existing patterns for loading states and error handling

### Working with Supabase
Always check availability before operations:
```typescript
if (isSupabaseAvailable() && supabase) {
  // Supabase operations
} else {
  // Fallback logic
}
```

### Component Development
- Use existing UI components from `/components/ui/`
- Follow the established pattern of client components with "use client" directive
- Maintain consistent styling with `cn()` utility function