-- Vietnam Offshore Platform Seed Data
-- Migration 003: Insert sample data for testing

-- Insert sample users
INSERT INTO users (id, email, role, company_name, contact_person, phone, country, is_active, email_verified) VALUES
-- Buyers (Japanese companies looking for offshore partners)
('11111111-1111-1111-1111-111111111111', 'tanaka@techcorp.jp', 'buyer', 'TechCorp Japan', 'Tanaka Hiroshi', '+81-3-1234-5678', 'Japan', true, true),
('22222222-2222-2222-2222-222222222222', 'suzuki@innovate.jp', 'buyer', 'Innovate Solutions', 'Suzuki Kenji', '+81-3-2345-6789', 'Japan', true, true),
('33333333-3333-3333-3333-333333333333', 'yamamoto@digitalx.jp', 'buyer', 'Digital X', 'Yamamoto Yuki', '+81-3-3456-7890', 'Japan', true, true),

-- Vendors (Vietnamese offshore companies)
('44444444-4444-4444-4444-444444444444', 'nguyen@vietsoft.vn', 'vendor', 'VietSoft Solutions', 'Nguyen Van An', '+84-24-1234-5678', 'Vietnam', true, true),
('55555555-5555-5555-5555-555555555555', 'tran@techviet.vn', 'vendor', 'TechViet Development', 'Tran Thi Mai', '+84-28-2345-6789', 'Vietnam', true, true),
('66666666-6666-6666-6666-666666666666', 'le@offshoreplus.vn', 'vendor', 'Offshore Plus', 'Le Duc Minh', '+84-511-3456-7890', 'Vietnam', true, true),
('77777777-7777-7777-7777-777777777777', 'pham@codevn.vn', 'vendor', 'CodeVN Solutions', 'Pham Hong Duc', '+84-24-4567-8901', 'Vietnam', true, true),
('88888888-8888-8888-8888-888888888888', 'hoang@smartdev.vn', 'vendor', 'SmartDev Vietnam', 'Hoang Xuan Truong', '+84-28-5678-9012', 'Vietnam', true, true),

-- Admin
('99999999-9999-9999-9999-999999999999', 'admin@vnoffshore.com', 'admin', 'VN Offshore Platform', 'Admin User', '+84-24-9999-9999', 'Vietnam', true, true),

-- Guest user for testing (using proper UUID format)
('00000000-0000-0000-0000-000000000001', 'guest@buyer.com', 'buyer', 'Guest Buyer Company', 'Guest User', '+81-3-0000-0000', 'Japan', true, false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample companies
INSERT INTO companies (
  id, user_id, company_name, description, website, established_year, 
  employee_count, location, address, status, hourly_rate_min, hourly_rate_max, 
  currency, average_rating, total_reviews
) VALUES
-- VietSoft Solutions (Hanoi)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 
 'VietSoft Solutions', 
 'Leading offshore development company specializing in web and mobile applications. We have extensive experience working with Japanese clients.',
 'https://vietsoft.vn', 2015, 150, 'Hanoi', 
 '123 Duy Tan Street, Cau Giay District, Hanoi', 'approved', 
 25, 45, 'USD', 4.5, 12),

-- TechViet Development (Ho Chi Minh)
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 
 'TechViet Development', 
 'Full-stack development services with expertise in React, Node.js, and cloud technologies. ISO 27001 certified.',
 'https://techviet.vn', 2018, 80, 'Ho Chi Minh City', 
 '456 Nguyen Hue Blvd, District 1, Ho Chi Minh City', 'approved', 
 20, 35, 'USD', 4.2, 8),

-- Offshore Plus (Da Nang)
('cccccccc-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', 
 'Offshore Plus', 
 'Specialized in AI/ML solutions and enterprise software development. Strong partnership with Japanese IT companies.',
 'https://offshoreplus.vn', 2016, 200, 'Da Nang', 
 '789 Bach Dang Street, Hai Chau District, Da Nang', 'approved', 
 30, 50, 'USD', 4.7, 15),

-- CodeVN Solutions (Hanoi)
('dddddddd-dddd-dddd-dddd-dddddddddddd', '77777777-7777-7777-7777-777777777777', 
 'CodeVN Solutions', 
 'Blockchain and fintech development experts. We provide dedicated teams for long-term projects.',
 'https://codevn.vn', 2019, 60, 'Hanoi', 
 '321 Le Duan Street, Dong Da District, Hanoi', 'approved', 
 22, 38, 'USD', 4.0, 5),

-- SmartDev Vietnam (Ho Chi Minh)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '88888888-8888-8888-8888-888888888888', 
 'SmartDev Vietnam', 
 'IoT and embedded systems development. We have Japanese-speaking BrSE team for smooth communication.',
 'https://smartdev.vn', 2017, 100, 'Ho Chi Minh City', 
 '654 Le Loi Avenue, District 3, Ho Chi Minh City', 'approved', 
 28, 42, 'USD', 4.4, 10)
ON CONFLICT (id) DO NOTHING;

-- Insert sample technologies for companies
INSERT INTO company_technologies (company_id, technology, proficiency_level, years_experience) VALUES
-- VietSoft Solutions
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'React', 5, 7),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Node.js', 5, 6),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TypeScript', 4, 4),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'AWS', 4, 5),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MongoDB', 4, 5),

-- TechViet Development
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Vue.js', 5, 5),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Python', 4, 4),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Django', 4, 4),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PostgreSQL', 5, 6),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Docker', 4, 3),

-- Offshore Plus
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Python', 5, 7),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'TensorFlow', 4, 4),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'React', 4, 5),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Java', 5, 8),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Spring Boot', 4, 5),

-- CodeVN Solutions
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Solidity', 4, 3),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Web3.js', 4, 3),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Node.js', 5, 4),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'React Native', 4, 3),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'GraphQL', 3, 2),

-- SmartDev Vietnam
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'C++', 5, 6),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Python', 4, 5),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Raspberry Pi', 4, 4),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Arduino', 4, 4),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'MQTT', 4, 3)
ON CONFLICT DO NOTHING;

-- Insert sample conversations
INSERT INTO conversations (id, buyer_id, vendor_id, company_id) VALUES
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT DO NOTHING;

-- Insert sample messages
INSERT INTO messages (conversation_id, sender_id, receiver_id, content, is_read) VALUES
-- Conversation 1
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 
 'Hello, we are interested in your React development services. Can we schedule a call?', true),
('c1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 
 'Thank you for your interest! We would be happy to discuss your project. How about next Tuesday at 2 PM JST?', true),
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 
 'That works perfectly. Please send me the meeting link.', false),

-- Conversation 2
('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 
 'We need a Vue.js developer team for our new project. What is your availability?', true),
('c2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 
 'We have a team of 5 Vue.js developers available immediately. Shall we discuss your requirements?', false),

-- Conversation 3
('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 
 'We are looking for AI/ML expertise for a recommendation engine. Can you help?', true),
('c3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 
 'Absolutely! We have extensive experience with recommendation systems. We can start with a PoC if you like.', true)
ON CONFLICT DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (company_id, reviewer_id, rating, comment, technical_skills, communication, delivery_time) VALUES
-- Reviews for VietSoft Solutions
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 5, 
 'Excellent team with strong technical skills. Communication in Japanese was smooth thanks to their BrSE team.', 5, 5, 5),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 4, 
 'Good quality code and on-time delivery. Minor issues with time zone differences but manageable.', 4, 3, 5),

-- Reviews for TechViet Development
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 4, 
 'Professional team with good Vue.js expertise. Documentation could be improved.', 4, 4, 4),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 5, 
 'Great experience working with them. Very responsive and flexible to requirement changes.', 5, 5, 4),

-- Reviews for Offshore Plus
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 5, 
 'Outstanding AI/ML capabilities. They delivered a complex recommendation system ahead of schedule.', 5, 4, 5),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 4, 
 'Strong technical team. Good project management and regular status updates.', 4, 5, 4)
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
('11111111-1111-1111-1111-111111111111', 'New Message', 'You have received a reply from VietSoft Solutions', 'info'),
('44444444-4444-4444-4444-444444444444', 'New Review', 'TechCorp Japan has left a 5-star review', 'success'),
('55555555-5555-5555-5555-555555555555', 'New Inquiry', 'You have a new inquiry from Innovate Solutions', 'info')
ON CONFLICT DO NOTHING;

-- Insert sample inquiries
INSERT INTO inquiries (company_id, inquirer_id, subject, message, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 
 'React Development Team Inquiry', 
 'We are looking for a React development team for our e-commerce project. Can you provide details about your team availability and rates?', 
 'responded'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 
 'Vue.js Project Collaboration', 
 'We need experienced Vue.js developers for a 6-month project. Please share your portfolio and team structure.', 
 'pending'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 
 'AI/ML Development Services', 
 'Interested in your AI/ML capabilities for a recommendation engine project. Can we discuss requirements?', 
 'responded')
ON CONFLICT DO NOTHING;

-- Insert sample projects
INSERT INTO company_projects (company_id, project_name, client_name, description, technologies, start_date, end_date) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'E-commerce Platform', 'Confidential', 
 'Built a scalable e-commerce platform handling 100k+ daily users', 
 ARRAY['React', 'Node.js', 'MongoDB', 'AWS'], '2023-01-01', '2023-06-30'),
 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mobile Banking App', 'Japanese Bank', 
 'Developed secure mobile banking application with biometric authentication', 
 ARRAY['React Native', 'Node.js', 'PostgreSQL'], '2023-07-01', '2023-12-31'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HR Management System', 'Tech Company', 
 'Complete HR solution with employee management and payroll system', 
 ARRAY['Vue.js', 'Django', 'PostgreSQL'], '2023-03-01', '2023-09-30'),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 'AI Recommendation Engine', 'E-commerce Giant', 
 'Machine learning based product recommendation system', 
 ARRAY['Python', 'TensorFlow', 'Apache Spark'], '2023-02-01', '2023-08-31'),

('dddddddd-dddd-dddd-dddd-dddddddddddd', 'DeFi Trading Platform', 'Crypto Startup', 
 'Decentralized finance trading platform with automated market maker', 
 ARRAY['Solidity', 'Web3.js', 'React', 'Node.js'], '2023-04-01', '2023-10-31'),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Smart Factory IoT System', 'Manufacturing Company', 
 'IoT-based factory automation and monitoring system', 
 ARRAY['C++', 'Python', 'MQTT', 'InfluxDB'], '2023-05-01', '2023-11-30')
ON CONFLICT DO NOTHING;