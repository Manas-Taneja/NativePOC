-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations (id) ON DELETE SET NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (
        role IN ('owner', 'admin', 'member')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invites table
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  invite_code TEXT UNIQUE DEFAULT uuid_generate_v4()::TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Channels table
CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (
        type IN (
            'team',
            'ai-assistant',
            'direct'
        )
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_ai_response BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insights table
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('decision', 'risk', 'blocker', 'trend', 'summary')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  impact TEXT NOT NULL CHECK (impact IN ('critical', 'high', 'medium', 'low')),
  owner TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::JSONB,
  suggested_actions JSONB DEFAULT '[]'::JSONB,
  user_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assignee TEXT NOT NULL,
    state TEXT NOT NULL CHECK (
        state IN (
            'open',
            'in_progress',
            'done',
            'blocked'
        )
    ),
    due_at TIMESTAMPTZ,
    priority TEXT NOT NULL CHECK (
        priority IN ('p0', 'p1', 'p2')
    ),
    source_insight_id UUID REFERENCES insights (id) ON DELETE SET NULL,
    slack_permalink TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approvals table
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    requester TEXT NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'approved',
            'rejected'
        )
    ),
    sla_minutes INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_organization_id ON profiles (organization_id);

CREATE INDEX idx_channels_organization_id ON channels (organization_id);

CREATE INDEX idx_messages_channel_id ON messages (channel_id);

CREATE INDEX idx_messages_created_at ON messages (created_at);

CREATE INDEX idx_insights_organization_id ON insights (organization_id);

CREATE INDEX idx_insights_type ON insights(type);

CREATE INDEX idx_insights_impact ON insights (impact);

CREATE INDEX idx_tasks_organization_id ON tasks (organization_id);

CREATE INDEX idx_tasks_state ON tasks (state);

CREATE INDEX idx_approvals_organization_id ON approvals (organization_id);

CREATE INDEX idx_approvals_status ON approvals (status);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();