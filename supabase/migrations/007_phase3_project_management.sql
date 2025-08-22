-- Phase 3: Project Management Tables
-- SOW Week 5: Project tracking and management features

-- Create project status enum
CREATE TYPE project_status AS ENUM (
  'draft',
  'proposal',
  'negotiation',
  'active',
  'on_hold',
  'completed',
  'cancelled',
  'archived'
);

-- Create project priority enum
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Create milestone status enum
CREATE TYPE milestone_status AS ENUM (
  'pending',
  'in_progress',
  'review',
  'approved',
  'completed',
  'delayed'
);

-- Create task status enum
CREATE TYPE task_status AS ENUM (
  'todo',
  'in_progress',
  'review',
  'testing',
  'completed',
  'blocked',
  'cancelled'
);

-- Projects table for managing client projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'draft',
  priority project_priority NOT NULL DEFAULT 'medium',
  project_code TEXT UNIQUE,
  contract_value NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  estimated_hours INTEGER,
  actual_hours INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  technologies TEXT[] DEFAULT ARRAY[]::TEXT[],
  team_size INTEGER,
  project_manager_id UUID REFERENCES users(id),
  repository_url TEXT,
  documentation_url TEXT,
  staging_url TEXT,
  production_url TEXT,
  requirements JSONB DEFAULT '{}',
  deliverables JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  notes TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT
);

-- Project milestones for tracking major deliverables
CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status milestone_status NOT NULL DEFAULT 'pending',
  milestone_order INTEGER NOT NULL DEFAULT 1,
  due_date DATE,
  completed_date DATE,
  payment_percentage NUMERIC(5,2) DEFAULT 0,
  payment_amount NUMERIC(12,2),
  deliverables TEXT[],
  acceptance_criteria TEXT,
  is_payment_milestone BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project tasks for detailed work tracking
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority project_priority NOT NULL DEFAULT 'medium',
  task_code TEXT,
  assigned_to UUID REFERENCES users(id),
  reporter_id UUID REFERENCES users(id),
  estimated_hours NUMERIC(6,2),
  actual_hours NUMERIC(6,2) DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  dependencies UUID[] DEFAULT ARRAY[]::UUID[],
  attachments JSONB DEFAULT '[]',
  comments_count INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  blocked_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project team members
CREATE TABLE project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  responsibilities TEXT,
  allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
  hourly_rate NUMERIC(8,2),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Project comments for collaboration
CREATE TABLE project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES project_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  mentions UUID[] DEFAULT ARRAY[]::UUID[],
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT at_least_one_reference CHECK (
    project_id IS NOT NULL OR task_id IS NOT NULL OR milestone_id IS NOT NULL
  )
);

-- Project activity log for audit trail
CREATE TABLE project_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT NOT NULL,
  changes JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project documents and files
CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  document_type TEXT CHECK (document_type IN (
    'contract', 'proposal', 'requirement', 'design', 
    'documentation', 'report', 'invoice', 'other'
  )),
  version TEXT,
  is_latest BOOLEAN DEFAULT true,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project time tracking
CREATE TABLE project_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hours_logged NUMERIC(6,2) NOT NULL CHECK (hours_logged > 0),
  work_date DATE NOT NULL,
  description TEXT,
  is_billable BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX idx_projects_company_status ON projects(company_id, status);
CREATE INDEX idx_projects_client_status ON projects(client_id, status);
CREATE INDEX idx_projects_status_dates ON projects(status, start_date, end_date);
CREATE INDEX idx_projects_progress ON projects(progress_percentage) WHERE status = 'active';
CREATE INDEX idx_projects_technologies ON projects USING GIN(technologies);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX idx_milestones_project_order ON project_milestones(project_id, milestone_order);
CREATE INDEX idx_milestones_due_date ON project_milestones(due_date) WHERE status != 'completed';
CREATE INDEX idx_milestones_payment ON project_milestones(is_payment_milestone) WHERE is_payment_milestone = true;

CREATE INDEX idx_tasks_project_status ON project_tasks(project_id, status);
CREATE INDEX idx_tasks_assigned_to ON project_tasks(assigned_to, status) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_tasks_milestone ON project_tasks(milestone_id) WHERE milestone_id IS NOT NULL;
CREATE INDEX idx_tasks_due_date ON project_tasks(due_date) WHERE status NOT IN ('completed', 'cancelled');
CREATE INDEX idx_tasks_parent ON project_tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;

CREATE INDEX idx_team_members_project ON project_team_members(project_id, is_active);
CREATE INDEX idx_team_members_user ON project_team_members(user_id, is_active);

CREATE INDEX idx_comments_project ON project_comments(project_id, created_at DESC) WHERE project_id IS NOT NULL;
CREATE INDEX idx_comments_task ON project_comments(task_id, created_at DESC) WHERE task_id IS NOT NULL;
CREATE INDEX idx_comments_user ON project_comments(user_id, created_at DESC);

CREATE INDEX idx_activities_project ON project_activities(project_id, created_at DESC);
CREATE INDEX idx_activities_user ON project_activities(user_id, created_at DESC);

CREATE INDEX idx_time_logs_project_date ON project_time_logs(project_id, work_date);
CREATE INDEX idx_time_logs_user_date ON project_time_logs(user_id, work_date);
CREATE INDEX idx_time_logs_task ON project_time_logs(task_id) WHERE task_id IS NOT NULL;

-- Create update trigger for project progress
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  new_progress INTEGER;
BEGIN
  -- Count total and completed tasks for the project
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_tasks, completed_tasks
  FROM project_tasks
  WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);
  
  -- Calculate progress percentage
  IF total_tasks > 0 THEN
    new_progress := (completed_tasks * 100) / total_tasks;
    
    -- Update project progress
    UPDATE projects
    SET progress_percentage = new_progress,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating project progress
CREATE TRIGGER update_project_progress_on_task_change
  AFTER INSERT OR UPDATE OF status OR DELETE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_progress();

-- Create function to update task counts
CREATE OR REPLACE FUNCTION update_task_comment_count()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE project_tasks
    SET comments_count = comments_count + 1
    WHERE id = NEW.task_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE project_tasks
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.task_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating comment counts
CREATE TRIGGER update_task_comment_count_trigger
  AFTER INSERT OR DELETE ON project_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_task_comment_count();

-- Add column comments for documentation
COMMENT ON TABLE projects IS 'Main projects table for tracking client engagements';
COMMENT ON TABLE project_milestones IS 'Major deliverables and payment milestones for projects';
COMMENT ON TABLE project_tasks IS 'Detailed task tracking for project execution';
COMMENT ON TABLE project_team_members IS 'Team member assignments and roles in projects';
COMMENT ON TABLE project_comments IS 'Collaboration comments on projects, tasks, and milestones';
COMMENT ON TABLE project_activities IS 'Audit log of all project-related activities';
COMMENT ON TABLE project_documents IS 'Document management for project files';
COMMENT ON TABLE project_time_logs IS 'Time tracking entries for billing and reporting';