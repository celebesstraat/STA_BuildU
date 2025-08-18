-- Buildu Scotland Platform Database Schema
-- This schema supports the women's empowerment goal tracking platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_picture TEXT,
    date_of_birth DATE,
    location VARCHAR(200),
    employment_status VARCHAR(20) CHECK (employment_status IN ('unemployed', 'employed', 'seeking', 'student')) DEFAULT 'unemployed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Goals table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(20) CHECK (category IN ('employment', 'skills', 'wellbeing', 'childcare', 'other')) NOT NULL,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    target_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active',
    
    -- SMART goal fields
    is_smart_goal BOOLEAN DEFAULT FALSE,
    specific TEXT,
    measurable TEXT,
    achievable TEXT,
    relevant TEXT,
    time_bound TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress updates table
CREATE TABLE progress_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    update_type VARCHAR(30) CHECK (update_type IN ('milestone_completed', 'progress_note', 'evidence_added', 'setback')) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    evidence_url TEXT,
    evidence_type VARCHAR(20) CHECK (evidence_type IN ('photo', 'document', 'certificate', 'link')),
    progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI conversations table
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    conversation_type VARCHAR(30) CHECK (conversation_type IN ('goal_setting', 'motivation', 'problem_solving', 'celebration', 'general')) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI messages table
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Motivational content table
CREATE TABLE motivational_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) CHECK (type IN ('quote', 'affirmation', 'tip', 'story')) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100),
    category VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    is_personalized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table (for tracking engagement)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    pages_visited INTEGER DEFAULT 0,
    goals_updated INTEGER DEFAULT 0,
    ai_interactions INTEGER DEFAULT 0
);

-- Indexes for better performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_target_date ON goals(target_date);

CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_target_date ON milestones(target_date);

CREATE INDEX idx_progress_updates_goal_id ON progress_updates(goal_id);
CREATE INDEX idx_progress_updates_user_id ON progress_updates(user_id);
CREATE INDEX idx_progress_updates_created_at ON progress_updates(created_at);

CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_goal_id ON ai_conversations(goal_id);

CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_start ON user_sessions(session_start);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can only access their own data" ON users
    FOR ALL USING (auth.uid() = id);

-- Goals policies
CREATE POLICY "Users can access their own goals" ON goals
    FOR ALL USING (auth.uid() = user_id);

-- Milestones policies (via goals relationship)
CREATE POLICY "Users can access milestones for their goals" ON milestones
    FOR ALL USING (EXISTS (
        SELECT 1 FROM goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid()
    ));

-- Progress updates policies
CREATE POLICY "Users can access their own progress updates" ON progress_updates
    FOR ALL USING (auth.uid() = user_id);

-- AI conversations policies
CREATE POLICY "Users can access their own AI conversations" ON ai_conversations
    FOR ALL USING (auth.uid() = user_id);

-- AI messages policies (via conversations relationship)
CREATE POLICY "Users can access messages for their conversations" ON ai_messages
    FOR ALL USING (EXISTS (
        SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()
    ));

-- User sessions policies
CREATE POLICY "Users can access their own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically complete milestone when progress update marks it
CREATE OR REPLACE FUNCTION auto_complete_milestone()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.update_type = 'milestone_completed' AND NEW.milestone_id IS NOT NULL THEN
        UPDATE milestones 
        SET 
            status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.milestone_id AND status != 'completed';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_complete_milestone_trigger 
    AFTER INSERT ON progress_updates 
    FOR EACH ROW EXECUTE FUNCTION auto_complete_milestone();

-- Function to calculate goal completion percentage
CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_milestones INTEGER;
    completed_milestones INTEGER;
    progress_percentage INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_milestones
    FROM milestones
    WHERE goal_id = goal_uuid;
    
    IF total_milestones = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO completed_milestones
    FROM milestones
    WHERE goal_id = goal_uuid AND status = 'completed';
    
    progress_percentage := (completed_milestones * 100) / total_milestones;
    
    RETURN progress_percentage;
END;
$$ language 'plpgsql';

-- Initial motivational content
INSERT INTO motivational_content (type, title, content, author, category, tags) VALUES
('quote', 'Courage to Continue', 'Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'perseverance', ARRAY['motivation', 'perseverance', 'courage']),
('quote', 'Beauty of Dreams', 'The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'dreams', ARRAY['dreams', 'future', 'belief']),
('quote', 'Focus on Light', 'It is during our darkest moments that we must focus to see the light.', 'Aristotle', 'resilience', ARRAY['resilience', 'hope', 'strength']),
('quote', 'Believe You Can', 'Believe you can and you are halfway there.', 'Theodore Roosevelt', 'confidence', ARRAY['confidence', 'belief', 'success']),
('quote', 'Begin the Journey', 'The only impossible journey is the one you never begin.', 'Tony Robbins', 'motivation', ARRAY['motivation', 'action', 'journey']),
('tip', 'Start Small', 'Break your larger goal into smaller, manageable steps. Each small win builds momentum toward your bigger achievement.', null, 'goal-setting', ARRAY['goals', 'planning', 'progress']),
('tip', 'Write It Down', 'Goals that are written down are 42% more likely to be achieved. Make your intentions concrete and visible.', null, 'goal-setting', ARRAY['goals', 'writing', 'success']),
('tip', 'Set Deadlines', 'A goal without a deadline is just a wish. Give yourself a specific timeframe to create urgency and accountability.', null, 'goal-setting', ARRAY['goals', 'deadlines', 'accountability']);

-- Comments for documentation
COMMENT ON TABLE users IS 'Platform users - women in the Buildu Scotland programme';
COMMENT ON TABLE goals IS 'User-defined goals using SMART criteria';
COMMENT ON TABLE milestones IS 'Smaller steps that make up larger goals';
COMMENT ON TABLE progress_updates IS 'User updates on goal progress with evidence and mood tracking';
COMMENT ON TABLE ai_conversations IS 'AI coaching conversations with context';
COMMENT ON TABLE ai_messages IS 'Individual messages within AI conversations';
COMMENT ON TABLE motivational_content IS 'Inspirational quotes, tips, and content for users';
COMMENT ON TABLE user_sessions IS 'User engagement tracking for analytics';

-- Views for common queries
CREATE VIEW active_goals_with_progress AS
SELECT 
    g.*,
    calculate_goal_progress(g.id) as progress_percentage,
    COUNT(m.id) as total_milestones,
    COUNT(CASE WHEN m.status = 'completed' THEN 1 END) as completed_milestones
FROM goals g
LEFT JOIN milestones m ON g.id = m.goal_id
WHERE g.status = 'active'
GROUP BY g.id;

CREATE VIEW user_dashboard_stats AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    COUNT(g.id) as total_goals,
    COUNT(CASE WHEN g.status = 'active' THEN 1 END) as active_goals,
    COUNT(CASE WHEN g.status = 'completed' THEN 1 END) as completed_goals,
    COALESCE(AVG(calculate_goal_progress(g.id)), 0)::INTEGER as avg_progress,
    COUNT(pu.id) as total_updates,
    MAX(pu.created_at) as last_activity
FROM users u
LEFT JOIN goals g ON u.id = g.user_id
LEFT JOIN progress_updates pu ON u.id = pu.user_id
GROUP BY u.id, u.first_name, u.last_name;