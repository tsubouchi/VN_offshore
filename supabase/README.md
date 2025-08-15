# Supabase Database Migrations

## Overview
This directory contains SQL migration files for the Vietnam Offshore Development Platform database.

## Directory Structure
```
supabase/
├── migrations/
│   ├── 000_reset_database.sql        # Database reset
│   ├── 001_create_schema.sql         # Schema creation
│   └── 002_enable_rls_policies.sql   # RLS policies
├── seeds/
│   └── 001_seed_data.sql            # Sample data
└── README.md
```

## Migration Files (Execute in order)

### migrations/

#### 1. `000_reset_database.sql`
- **Purpose**: Complete database reset
- **Actions**: Drops all existing tables, types, and functions
- **When to use**: Fresh start or major schema changes

#### 2. `001_create_schema.sql`
- **Purpose**: Create all database tables and schema
- **Tables created**:
  - `users` - User accounts (buyers, vendors, admins)
  - `companies` - Vendor company profiles
  - `conversations` - Chat conversations between users
  - `messages` - Individual chat messages
  - `reviews` - Company reviews and ratings
  - `inquiries` - Business inquiries
  - `notifications` - User notifications
  - `company_technologies` - Technologies used by companies
  - `company_projects` - Company project portfolios
- **Includes**: Indexes and triggers for `updated_at` columns

#### 3. `002_enable_rls_policies.sql`
- **Purpose**: Enable Row Level Security
- **Current state**: Development mode (permissive policies)
- **Note**: Replace with auth-based policies for production

### seeds/

#### 1. `001_seed_data.sql`
- **Purpose**: Insert sample test data
- **Data includes**:
  - Sample users (buyers, vendors, admin, guest)
  - Vietnamese companies with profiles
  - Technologies and projects
  - Sample conversations and messages
  - Reviews and ratings
  - Notifications and inquiries

## How to Execute

### Using Supabase CLI
```bash
# Reset database (optional)
supabase db reset

# Run migrations
supabase migration up
```

### Manual Execution (PostgreSQL)
```bash
# Connect to your database
psql -h <host> -U <user> -d <database>

# Execute migrations in order
\i migrations/000_reset_database.sql
\i migrations/001_create_schema.sql
\i migrations/002_enable_rls_policies.sql

# Execute seed data
\i seeds/001_seed_data.sql
```

## Important UUIDs

### Test User IDs
- Guest Buyer: `00000000-0000-0000-0000-000000000001`
- Admin: `99999999-9999-9999-9999-999999999999`
- Japanese Buyers: `11111111-*`, `22222222-*`, `33333333-*`
- Vietnamese Vendors: `44444444-*` through `88888888-*`

### Test Company IDs
- VietSoft Solutions: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`
- TechViet Development: `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`
- Offshore Plus: `cccccccc-cccc-cccc-cccc-cccccccccccc`
- CodeVN Solutions: `dddddddd-dddd-dddd-dddd-dddddddddddd`
- SmartDev Vietnam: `eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee`

### Test Conversation IDs
- Conversation 1: `c1111111-1111-1111-1111-111111111111`
- Conversation 2: `c2222222-2222-2222-2222-222222222222`
- Conversation 3: `c3333333-3333-3333-3333-333333333333`

## Notes

1. **No Auth Integration**: The current schema doesn't require Supabase Auth (`auth.users` table). The `profiles` table is commented out for future use.

2. **RLS Policies**: Currently set to permissive for development. In production, update policies to use proper authentication:
   ```sql
   -- Example production policy
   CREATE POLICY "users_update_own" ON users
     FOR UPDATE USING (auth.uid()::text = id::text);
   ```

3. **UUID Format**: All IDs must be valid UUIDs. Use the format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

4. **Contract Validation**: Run `pnpm contract` to validate UI-DB contracts after schema changes.

## Troubleshooting

### Common Errors

1. **"column does not exist"**: Run `000_reset_database.sql` first to clean up partial state
2. **"invalid input syntax for type uuid"**: Ensure all IDs are proper UUID format
3. **"relation does not exist"**: Execute migrations in numerical order
4. **RLS policy errors**: Check if auth.uid() is available (requires Supabase Auth setup)