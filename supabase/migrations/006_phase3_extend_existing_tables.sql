-- Phase 3: Extend existing tables with additional fields
-- SOW Week 5: Database Extension

-- Extend companies table with additional business information
ALTER TABLE companies ADD COLUMN IF NOT EXISTS
  business_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "18:00"}}',
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['English', 'Vietnamese'],
  ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS founded_date DATE,
  ADD COLUMN IF NOT EXISTS legal_name TEXT,
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS response_time TEXT DEFAULT '24 hours',
  ADD COLUMN IF NOT EXISTS completion_rate NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS repeat_client_rate NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS service_categories TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Extend users table with profile and preference settings
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  timezone TEXT DEFAULT 'Asia/Tokyo',
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'ja',
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profile_completion_rate INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  ADD COLUMN IF NOT EXISTS search_history JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS preferred_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS budget_range JSONB DEFAULT '{"min": null, "max": null, "currency": "USD"}';

-- Extend messages table for enhanced messaging features
ALTER TABLE messages ADD COLUMN IF NOT EXISTS
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system', 'voice', 'video')),
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_size INTEGER,
  ADD COLUMN IF NOT EXISTS is_system_message BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES messages(id),
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reaction_emojis JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_companies_is_featured ON companies(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_companies_status_featured ON companies(status, is_featured);
CREATE INDEX IF NOT EXISTS idx_companies_languages ON companies USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_companies_certifications ON companies USING GIN(certifications);
CREATE INDEX IF NOT EXISTS idx_companies_tags ON companies USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_companies_specializations ON companies USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_companies_service_categories ON companies USING GIN(service_categories);
CREATE INDEX IF NOT EXISTS idx_companies_last_activity ON companies(last_activity_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_users_preferred_language ON users(preferred_language);
CREATE INDEX IF NOT EXISTS idx_users_preferred_categories ON users USING GIN(preferred_categories);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_message_id) WHERE parent_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON messages(is_deleted) WHERE is_deleted = false;

-- Add update trigger for last_activity_at
CREATE OR REPLACE FUNCTION update_company_last_activity()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the sender is a company (for messages table)
  IF TG_TABLE_NAME = 'messages' THEN
    IF EXISTS (SELECT 1 FROM companies WHERE user_id = NEW.sender_id) THEN
      UPDATE companies 
      SET last_activity_at = NOW()
      WHERE user_id = NEW.sender_id;
    END IF;
  ELSE
    -- For other tables that have company_id directly
    UPDATE companies 
    SET last_activity_at = NOW()
    WHERE id = NEW.company_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for company activity updates
DROP TRIGGER IF EXISTS update_company_activity_on_message ON messages;
CREATE TRIGGER update_company_activity_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_company_last_activity();

DROP TRIGGER IF EXISTS update_company_activity_on_inquiry ON inquiries;
CREATE TRIGGER update_company_activity_on_inquiry
  AFTER INSERT OR UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_company_last_activity();

-- Add comment documentation
COMMENT ON COLUMN companies.business_hours IS 'JSON object with weekday keys and open/close times';
COMMENT ON COLUMN companies.languages IS 'Array of supported languages for communication';
COMMENT ON COLUMN companies.certifications IS 'Array of professional certifications (ISO, CMMI, etc.)';
COMMENT ON COLUMN companies.social_links IS 'JSON object with social media URLs (linkedin, facebook, twitter, etc.)';
COMMENT ON COLUMN companies.response_time IS 'Average response time to inquiries';
COMMENT ON COLUMN companies.completion_rate IS 'Percentage of successfully completed projects';
COMMENT ON COLUMN companies.repeat_client_rate IS 'Percentage of clients who return for additional projects';

COMMENT ON COLUMN users.timezone IS 'User timezone for scheduling and notifications';
COMMENT ON COLUMN users.preferred_language IS 'User preferred UI language (ja, en, vi)';
COMMENT ON COLUMN users.profile_completion_rate IS 'Percentage of profile fields completed (0-100)';
COMMENT ON COLUMN users.notification_preferences IS 'JSON object with notification channel preferences';
COMMENT ON COLUMN users.search_history IS 'JSON array of recent search queries';
COMMENT ON COLUMN users.budget_range IS 'JSON object with min/max budget and currency';

COMMENT ON COLUMN messages.message_type IS 'Type of message content (text, file, image, system, voice, video)';
COMMENT ON COLUMN messages.parent_message_id IS 'Reference to parent message for threading/replies';
COMMENT ON COLUMN messages.reaction_emojis IS 'JSON object with emoji reactions and user IDs';
COMMENT ON COLUMN messages.metadata IS 'Additional message metadata (delivery status, encryption info, etc.)';