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

# Code quality checks ✅
pnpm lint            # Run ESLint - No warnings or errors
pnpm type-check      # TypeScript type checking - All checks pass

# Testing ✅
pnpm test            # Run Jest tests - All tests pass
pnpm test:watch      # Run tests in watch mode
pnpm test:coverage   # Run tests with coverage report - 24 tests pass

# Contract validation ✅
pnpm contract          # Run contract validation - All contracts valid
pnpm contract:extract  # Extract contracts from code
pnpm contract:validate # Validate contracts with tests - 6 tests pass
```

### Command Status
All commands are working successfully:
- ✅ `pnpm lint` - No ESLint warnings or errors
- ✅ `pnpm type-check` - All TypeScript checks pass
- ✅ `pnpm test:coverage` - 24 tests passing with coverage report
- ✅ `pnpm contract` - All UI-DB contracts are valid

## Environment Variables Required

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GEMINI_API_KEY=
```

## Supabase Overview

Supabase provides the backend infrastructure for authentication, database, and real-time features:

### Key Features Used
- **Authentication**: User signup/login with email/password
- **Database**: PostgreSQL for storing companies, reviews, messages
- **Real-time**: Live updates for chat messages and notifications
- **Row Level Security (RLS)**: Secure data access based on user roles
- **Storage**: File uploads for company logos and attachments

### Database Schema
- `users`: User accounts with roles (buyer/vendor/admin)
- `companies`: Vendor company information
- `conversations`: Chat conversations between users
- `messages`: Chat messages within conversations
- `reviews`: Customer reviews and ratings
- `notifications`: System and user notifications
- `inquiries`: Contact form submissions
- `company_technologies`: Technologies and skills per company
- `company_projects`: Portfolio projects per company

### Database Files Structure
```
supabase/
├── migrations/
│   ├── 000_reset_database.sql        # Database reset
│   ├── 001_create_schema.sql         # Tables and schema
│   └── 002_enable_rls_policies.sql   # Row Level Security
├── seeds/
│   └── 001_seed_data.sql            # Sample test data
└── README.md                         # Database documentation
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

- **TypeScript**: Strict mode enabled, all type checks passing
- **ESLint**: Configured and passing with no warnings or errors
- **Testing**: Jest with React Testing Library, 24 tests passing
- **Contract Validation**: UI-DB contracts automatically validated
- **Styling**: Tailwind CSS v4 with CSS-in-JS approach
- **Package Manager**: Uses pnpm (lockfile: `pnpm-lock.yaml`)
- **Path Alias**: `@/` maps to project root

## Common Tasks

### Adding New Pages
1. Create route in `/app` directory
2. Implement auth guards if needed using `useAuth()` hook
3. Follow existing patterns for loading states and error handling

### Working with Supabase

#### Connection Check
Always check availability before operations:
```typescript
if (isSupabaseAvailable() && supabase) {
  // Supabase operations
} else {
  // Fallback logic
}
```

#### Null Safety
When using supabase in static methods, use non-null assertion after checking:
```typescript
if (!supabase) {
  throw new Error("Supabase client not initialized")
}
const { data, error } = await supabase!
  .from('table')
  .select('*')
```

#### Common Supabase Operations

```typescript
// Authentication
const { data, error } = await supabase.auth.signIn({ email, password })

// Database queries
const { data: companies } = await supabase
  .from('companies')
  .select('*')
  .eq('location', 'Hanoi')

// Real-time subscriptions
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleNewMessage)
  .subscribe()

// File uploads
const { data, error } = await supabase.storage
  .from('company-logos')
  .upload(path, file)
```

### Component Development
- Use existing UI components from `/components/ui/`
- Follow the established pattern of client components with "use client" directive
- Maintain consistent styling with `cn()` utility function