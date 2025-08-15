-- Vietnam Offshore Platform RLS Policies
-- Row Level Security configuration for all tables

-- Enable RLS on all tables with existence checks
DO $$ 
BEGIN
  -- Enable RLS for each table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public') THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'companies' AND schemaname = 'public') THEN
    ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'conversations' AND schemaname = 'public') THEN
    ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'messages' AND schemaname = 'public') THEN
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'reviews' AND schemaname = 'public') THEN
    ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'inquiries' AND schemaname = 'public') THEN
    ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'notifications' AND schemaname = 'public') THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'company_technologies' AND schemaname = 'public') THEN
    ALTER TABLE company_technologies ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'company_projects' AND schemaname = 'public') THEN
    ALTER TABLE company_projects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create permissive policies for development
-- These allow full access and should be replaced with proper auth-based policies in production

-- Users table policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public') THEN
    DROP POLICY IF EXISTS "users_public_access" ON users;
    CREATE POLICY "users_public_access" ON users
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Companies table policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'companies' AND schemaname = 'public') THEN
    DROP POLICY IF EXISTS "companies_public_access" ON companies;
    CREATE POLICY "companies_public_access" ON companies
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Conversations table policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'conversations' AND schemaname = 'public') THEN
    DROP POLICY IF EXISTS "conversations_public_access" ON conversations;
    CREATE POLICY "conversations_public_access" ON conversations
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Messages table policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'messages' AND schemaname = 'public') THEN
    DROP POLICY IF EXISTS "messages_public_access" ON messages;
    CREATE POLICY "messages_public_access" ON messages
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Reviews table policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'reviews' AND schemaname = 'public') THEN
    DROP POLICY IF EXISTS "reviews_public_access" ON reviews;
    CREATE POLICY "reviews_public_access" ON reviews
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Inquiries table policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'inquiries' AND schemaname = 'public') THEN
    DROP POLICY IF EXISTS "inquiries_public_access" ON inquiries;
    CREATE POLICY "inquiries_public_access" ON inquiries
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Notifications table policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'notifications' AND schemaname = 'public') THEN
    DROP POLICY IF EXISTS "notifications_public_access" ON notifications;
    CREATE POLICY "notifications_public_access" ON notifications
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Company technologies table policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'company_technologies' AND schemaname = 'public') THEN
    DROP POLICY IF EXISTS "company_technologies_public_access" ON company_technologies;
    CREATE POLICY "company_technologies_public_access" ON company_technologies
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Company projects table policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'company_projects' AND schemaname = 'public') THEN
    DROP POLICY IF EXISTS "company_projects_public_access" ON company_projects;
    CREATE POLICY "company_projects_public_access" ON company_projects
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Note: These are permissive policies for development
-- In production, replace with proper auth-based policies like:
-- 
-- CREATE POLICY "users_select_own" ON users
--   FOR SELECT USING (auth.uid()::text = id::text OR true);
-- 
-- CREATE POLICY "users_update_own" ON users
--   FOR UPDATE USING (auth.uid()::text = id::text);
-- 
-- CREATE POLICY "messages_select_own" ON messages
--   FOR SELECT USING (
--     sender_id::text = auth.uid()::text OR 
--     receiver_id::text = auth.uid()::text
--   );
--
-- CREATE POLICY "companies_select_approved" ON companies
--   FOR SELECT USING (status = 'approved' OR user_id::text = auth.uid()::text);