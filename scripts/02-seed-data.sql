-- Seed data for Vietnamese-Japanese Offshore Matching Platform

-- Insert sample industries
INSERT INTO industries (name, name_ja) VALUES
('Web Development', 'ウェブ開発'),
('Mobile App Development', 'モバイルアプリ開発'),
('E-commerce', 'Eコマース'),
('Fintech', 'フィンテック'),
('Healthcare', 'ヘルスケア'),
('Education', '教育'),
('Gaming', 'ゲーム'),
('IoT', 'IoT'),
('AI/Machine Learning', 'AI/機械学習'),
('Blockchain', 'ブロックチェーン');

-- Insert sample technologies
INSERT INTO technologies (name, category) VALUES
-- Frontend
('React', 'Frontend'),
('Vue.js', 'Frontend'),
('Angular', 'Frontend'),
('Next.js', 'Frontend'),
('TypeScript', 'Frontend'),
('JavaScript', 'Frontend'),
('HTML/CSS', 'Frontend'),
('Tailwind CSS', 'Frontend'),

-- Backend
('Node.js', 'Backend'),
('Python', 'Backend'),
('Java', 'Backend'),
('PHP', 'Backend'),
('Ruby on Rails', 'Backend'),
('Go', 'Backend'),
('.NET', 'Backend'),
('Express.js', 'Backend'),

-- Database
('PostgreSQL', 'Database'),
('MySQL', 'Database'),
('MongoDB', 'Database'),
('Redis', 'Database'),
('Firebase', 'Database'),

-- Mobile
('React Native', 'Mobile'),
('Flutter', 'Mobile'),
('iOS (Swift)', 'Mobile'),
('Android (Kotlin)', 'Mobile'),

-- DevOps
('AWS', 'DevOps'),
('Docker', 'DevOps'),
('Kubernetes', 'DevOps'),
('CI/CD', 'DevOps'),
('Vercel', 'DevOps');

-- Insert sample admin user
INSERT INTO users (email, role, company_name, contact_person, country, email_verified) VALUES
('admin@offshore-match.com', 'admin', 'Offshore Match Platform', 'Admin User', 'Japan', true);
