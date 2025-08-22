-- Enable Row Level Security for Project Management Tables
-- This migration adds RLS policies to secure project-related data

-- Enable RLS on all project management tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_time_logs ENABLE ROW LEVEL SECURITY;

-- ====================================
-- PROJECTS TABLE POLICIES
-- ====================================

-- Allow public read access to public projects
DROP POLICY IF EXISTS "projects_public_read" ON projects;
CREATE POLICY "projects_public_read" ON projects
  FOR SELECT
  TO PUBLIC
  USING (is_public = true);

-- Allow authenticated users to view their own projects (as client or vendor)
DROP POLICY IF EXISTS "projects_authenticated_read" ON projects;
CREATE POLICY "projects_authenticated_read" ON projects
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR
    auth.uid() IN (
      SELECT user_id FROM companies WHERE id = company_id
    ) OR
    auth.uid() IN (
      SELECT user_id FROM project_team_members WHERE project_id = projects.id
    )
  );

-- Allow company owners to create projects
DROP POLICY IF EXISTS "projects_company_create" ON projects;
CREATE POLICY "projects_company_create" ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM companies WHERE id = company_id
    )
  );

-- Allow company owners and clients to update their projects
DROP POLICY IF EXISTS "projects_update" ON projects;
CREATE POLICY "projects_update" ON projects
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = client_id OR
    auth.uid() IN (
      SELECT user_id FROM companies WHERE id = company_id
    )
  )
  WITH CHECK (
    auth.uid() = client_id OR
    auth.uid() IN (
      SELECT user_id FROM companies WHERE id = company_id
    )
  );

-- Allow admins full access to projects
DROP POLICY IF EXISTS "projects_admin_all" ON projects;
CREATE POLICY "projects_admin_all" ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ====================================
-- PROJECT MILESTONES POLICIES
-- ====================================

-- Allow team members to view milestones
DROP POLICY IF EXISTS "milestones_team_read" ON project_milestones;
CREATE POLICY "milestones_team_read" ON project_milestones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.client_id = auth.uid() OR
        p.is_public = true OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        ) OR
        auth.uid() IN (
          SELECT user_id FROM project_team_members WHERE project_id = p.id
        )
      )
    )
  );

-- Allow project managers to manage milestones
DROP POLICY IF EXISTS "milestones_manager_all" ON project_milestones;
CREATE POLICY "milestones_manager_all" ON project_milestones
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.project_manager_id = auth.uid() OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        )
      )
    )
  );

-- ====================================
-- PROJECT TASKS POLICIES
-- ====================================

-- Allow team members to view tasks
DROP POLICY IF EXISTS "tasks_team_read" ON project_tasks;
CREATE POLICY "tasks_team_read" ON project_tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.client_id = auth.uid() OR
        p.is_public = true OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        ) OR
        auth.uid() IN (
          SELECT user_id FROM project_team_members WHERE project_id = p.id
        )
      )
    )
  );

-- Allow assigned users to update their tasks
DROP POLICY IF EXISTS "tasks_assigned_update" ON project_tasks;
CREATE POLICY "tasks_assigned_update" ON project_tasks
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Allow project managers and team leads to manage tasks
DROP POLICY IF EXISTS "tasks_manager_all" ON project_tasks;
CREATE POLICY "tasks_manager_all" ON project_tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.project_manager_id = auth.uid() OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        )
      )
    )
  );

-- ====================================
-- PROJECT TEAM MEMBERS POLICIES
-- ====================================

-- Allow viewing team members for accessible projects
DROP POLICY IF EXISTS "team_members_read" ON project_team_members;
CREATE POLICY "team_members_read" ON project_team_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.client_id = auth.uid() OR
        p.is_public = true OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        ) OR
        auth.uid() IN (
          SELECT user_id FROM project_team_members WHERE project_id = p.id
        )
      )
    )
  );

-- Allow project managers to manage team members
DROP POLICY IF EXISTS "team_members_manager_all" ON project_team_members;
CREATE POLICY "team_members_manager_all" ON project_team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.project_manager_id = auth.uid() OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        )
      )
    )
  );

-- ====================================
-- PROJECT COMMENTS POLICIES
-- ====================================

-- Allow team members to view comments
DROP POLICY IF EXISTS "comments_team_read" ON project_comments;
CREATE POLICY "comments_team_read" ON project_comments
  FOR SELECT
  TO authenticated
  USING (
    -- Check if user has access to the related project
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.client_id = auth.uid() OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        ) OR
        auth.uid() IN (
          SELECT user_id FROM project_team_members WHERE project_id = p.id
        )
      )
    )) OR
    -- Check if user has access to the related task's project
    (task_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM project_tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.id = task_id AND (
        p.client_id = auth.uid() OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        ) OR
        auth.uid() IN (
          SELECT user_id FROM project_team_members WHERE project_id = p.id
        )
      )
    )) OR
    -- Check if user has access to the related milestone's project
    (milestone_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM project_milestones m
      JOIN projects p ON m.project_id = p.id
      WHERE m.id = milestone_id AND (
        p.client_id = auth.uid() OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        ) OR
        auth.uid() IN (
          SELECT user_id FROM project_team_members WHERE project_id = p.id
        )
      )
    ))
  );

-- Allow authenticated users to create comments on accessible projects
DROP POLICY IF EXISTS "comments_authenticated_create" ON project_comments;
CREATE POLICY "comments_authenticated_create" ON project_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      -- Check project access
      (project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_id AND (
          p.client_id = auth.uid() OR
          auth.uid() IN (
            SELECT user_id FROM companies WHERE id = p.company_id
          ) OR
          auth.uid() IN (
            SELECT user_id FROM project_team_members WHERE project_id = p.id
          )
        )
      )) OR
      -- Check task access
      (task_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM project_tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE t.id = task_id AND (
          p.client_id = auth.uid() OR
          auth.uid() IN (
            SELECT user_id FROM companies WHERE id = p.company_id
          ) OR
          auth.uid() IN (
            SELECT user_id FROM project_team_members WHERE project_id = p.id
          )
        )
      )) OR
      -- Check milestone access
      (milestone_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM project_milestones m
        JOIN projects p ON m.project_id = p.id
        WHERE m.id = milestone_id AND (
          p.client_id = auth.uid() OR
          auth.uid() IN (
            SELECT user_id FROM companies WHERE id = p.company_id
          ) OR
          auth.uid() IN (
            SELECT user_id FROM project_team_members WHERE project_id = p.id
          )
        )
      ))
    )
  );

-- Allow comment authors to update their own comments
DROP POLICY IF EXISTS "comments_author_update" ON project_comments;
CREATE POLICY "comments_author_update" ON project_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow comment authors to delete their own comments
DROP POLICY IF EXISTS "comments_author_delete" ON project_comments;
CREATE POLICY "comments_author_delete" ON project_comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ====================================
-- PROJECT ACTIVITIES POLICIES
-- ====================================

-- Allow team members to view project activities
DROP POLICY IF EXISTS "activities_team_read" ON project_activities;
CREATE POLICY "activities_team_read" ON project_activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.client_id = auth.uid() OR
        p.is_public = true OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        ) OR
        auth.uid() IN (
          SELECT user_id FROM project_team_members WHERE project_id = p.id
        )
      )
    )
  );

-- Allow system to create activity logs (through functions)
DROP POLICY IF EXISTS "activities_system_create" ON project_activities;
CREATE POLICY "activities_system_create" ON project_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.client_id = auth.uid() OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        ) OR
        auth.uid() IN (
          SELECT user_id FROM project_team_members WHERE project_id = p.id
        )
      )
    )
  );

-- ====================================
-- PROJECT DOCUMENTS POLICIES
-- ====================================

-- Allow team members to view project documents
DROP POLICY IF EXISTS "documents_team_read" ON project_documents;
CREATE POLICY "documents_team_read" ON project_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.client_id = auth.uid() OR
        p.is_public = true OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        ) OR
        auth.uid() IN (
          SELECT user_id FROM project_team_members WHERE project_id = p.id
        )
      )
    )
  );

-- Allow team members to upload documents
DROP POLICY IF EXISTS "documents_team_create" ON project_documents;
CREATE POLICY "documents_team_create" ON project_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.client_id = auth.uid() OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        ) OR
        auth.uid() IN (
          SELECT user_id FROM project_team_members WHERE project_id = p.id
        )
      )
    )
  );

-- Allow document uploaders and project managers to delete documents
DROP POLICY IF EXISTS "documents_delete" ON project_documents;
CREATE POLICY "documents_delete" ON project_documents
  FOR DELETE
  TO authenticated
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.project_manager_id = auth.uid() OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        )
      )
    )
  );

-- ====================================
-- PROJECT TIME LOGS POLICIES
-- ====================================

-- Allow team members to view time logs for their projects
DROP POLICY IF EXISTS "time_logs_team_read" ON project_time_logs;
CREATE POLICY "time_logs_team_read" ON project_time_logs
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.client_id = auth.uid() OR
        p.project_manager_id = auth.uid() OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        ) OR
        auth.uid() IN (
          SELECT user_id FROM project_team_members WHERE project_id = p.id
        )
      )
    )
  );

-- Allow users to create their own time logs
DROP POLICY IF EXISTS "time_logs_user_create" ON project_time_logs;
CREATE POLICY "time_logs_user_create" ON project_time_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM project_team_members
      WHERE project_id = project_time_logs.project_id 
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

-- Allow users to update their own unapproved time logs
DROP POLICY IF EXISTS "time_logs_user_update" ON project_time_logs;
CREATE POLICY "time_logs_user_update" ON project_time_logs
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_approved = false)
  WITH CHECK (user_id = auth.uid() AND is_approved = false);

-- Allow project managers to approve time logs
DROP POLICY IF EXISTS "time_logs_manager_approve" ON project_time_logs;
CREATE POLICY "time_logs_manager_approve" ON project_time_logs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.project_manager_id = auth.uid() OR
        auth.uid() IN (
          SELECT user_id FROM companies WHERE id = p.company_id
        )
      )
    )
  );

-- Allow users to delete their own unapproved time logs
DROP POLICY IF EXISTS "time_logs_user_delete" ON project_time_logs;
CREATE POLICY "time_logs_user_delete" ON project_time_logs
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_approved = false);

-- ====================================
-- ADMIN OVERRIDE POLICIES
-- ====================================

-- Allow admins full access to all project management tables
DROP POLICY IF EXISTS "milestones_admin_all" ON project_milestones;
CREATE POLICY "milestones_admin_all" ON project_milestones
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "tasks_admin_all" ON project_tasks;
CREATE POLICY "tasks_admin_all" ON project_tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "team_members_admin_all" ON project_team_members;
CREATE POLICY "team_members_admin_all" ON project_team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "comments_admin_all" ON project_comments;
CREATE POLICY "comments_admin_all" ON project_comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "activities_admin_all" ON project_activities;
CREATE POLICY "activities_admin_all" ON project_activities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "documents_admin_all" ON project_documents;
CREATE POLICY "documents_admin_all" ON project_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "time_logs_admin_all" ON project_time_logs;
CREATE POLICY "time_logs_admin_all" ON project_time_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );