-- Vietnam Offshore Platform Database Reset
-- Migration 000: Clean slate - Drop all existing objects and start fresh
-- WARNING: This will delete all data!

-- Drop all existing tables (cascade will handle dependencies)
DROP TABLE IF EXISTS company_projects CASCADE;
DROP TABLE IF EXISTS company_technologies CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS company_status CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;