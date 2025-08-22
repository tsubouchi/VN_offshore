-- Migration: Create user favorites and related tables
-- Phase 2: Save to Favorites functionality

-- User favorites table for storing user's favorite companies
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Contact history table for tracking user-company contacts
CREATE TABLE contact_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('chat', 'inquiry', 'email', 'modal')),
  subject TEXT,
  initial_message TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'responded', 'in_progress', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification settings table for user preferences
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_updates BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  system_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Company files table for managing company assets
CREATE TABLE company_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('logo', 'cover', 'portfolio', 'certificate', 'document', 'image')),
  file_size INTEGER,
  mime_type TEXT,
  alt_text TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_company_id ON user_favorites(company_id);
CREATE INDEX idx_user_favorites_created_at ON user_favorites(created_at);

CREATE INDEX idx_contact_history_buyer_id ON contact_history(buyer_id);
CREATE INDEX idx_contact_history_company_id ON contact_history(company_id);
CREATE INDEX idx_contact_history_status ON contact_history(status);
CREATE INDEX idx_contact_history_created_at ON contact_history(created_at);

CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);

CREATE INDEX idx_company_files_company_id ON company_files(company_id);
CREATE INDEX idx_company_files_file_type ON company_files(file_type);

-- Enable Row Level Security (RLS)
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_favorites
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for contact_history
CREATE POLICY "Users can view own contact history" ON contact_history
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can insert own contact history" ON contact_history
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Vendors can view contacts for their companies" ON contact_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = contact_history.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update contact status for their companies" ON contact_history
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = contact_history.company_id 
      AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for notification_settings
CREATE POLICY "Users can manage own notification settings" ON notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for company_files
CREATE POLICY "Everyone can view public company files" ON company_files
  FOR SELECT USING (is_public = true);

CREATE POLICY "Company owners can manage their files" ON company_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = company_files.company_id 
      AND c.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_user_favorites_updated_at
    BEFORE UPDATE ON user_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_history_updated_at
    BEFORE UPDATE ON contact_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_files_updated_at
    BEFORE UPDATE ON company_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();