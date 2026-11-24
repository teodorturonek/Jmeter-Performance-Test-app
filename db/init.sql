CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
    task_id VARCHAR(20) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    description VARCHAR(200) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE SEQUENCE task_id_seq START 51;

-- Seed users (passwords: password1 ... password10)
INSERT INTO users (username, password_hash) VALUES
('user1',  crypt('password1',  gen_salt('bf', 10))),
('user2',  crypt('password2',  gen_salt('bf', 10))),
('user3',  crypt('password3',  gen_salt('bf', 10))),
('user4',  crypt('password4',  gen_salt('bf', 10))),
('user5',  crypt('password5',  gen_salt('bf', 10))),
('user6',  crypt('password6',  gen_salt('bf', 10))),
('user7',  crypt('password7',  gen_salt('bf', 10))),
('user8',  crypt('password8',  gen_salt('bf', 10))),
('user9',  crypt('password9',  gen_salt('bf', 10))),
('user10', crypt('password10', gen_salt('bf', 10)));

-- Seed tasks
INSERT INTO tasks (task_id, user_id, description, due_date, status) VALUES
-- user1
('TASK-001', 1, 'Review quarterly budget report', '2026-09-15', 'active'),
('TASK-002', 1, 'Schedule team meeting for sprint planning', '2026-09-10', 'active'),
('TASK-003', 1, 'Update project documentation', '2026-09-20', 'completed'),
('TASK-004', 1, 'Prepare presentation for stakeholders', '2026-09-25', 'active'),
('TASK-005', 1, 'Submit expense claims', '2026-09-05', 'completed'),
-- user2
('TASK-006', 2, 'Fix login page styling issues', '2026-09-12', 'active'),
('TASK-007', 2, 'Write unit tests for API endpoints', '2026-09-18', 'active'),
('TASK-008', 2, 'Deploy staging environment', '2026-09-08', 'completed'),
('TASK-009', 2, 'Review pull request from team lead', '2026-09-14', 'active'),
('TASK-010', 2, 'Update dependencies to latest versions', '2026-09-22', 'active'),
-- user3
('TASK-011', 3, 'Design new dashboard layout', '2026-09-16', 'active'),
('TASK-012', 3, 'Conduct user research interviews', '2026-09-11', 'completed'),
('TASK-013', 3, 'Create wireframes for mobile app', '2026-09-19', 'active'),
('TASK-014', 3, 'Prepare design system components', '2026-09-24', 'active'),
('TASK-015', 3, 'Review accessibility audit findings', '2026-09-07', 'completed'),
-- user4
('TASK-016', 4, 'Set up monitoring alerts', '2026-09-13', 'active'),
('TASK-017', 4, 'Migrate database to new cluster', '2026-09-21', 'active'),
('TASK-018', 4, 'Write runbook for incident response', '2026-09-09', 'completed'),
('TASK-019', 4, 'Configure backup automation', '2026-09-17', 'active'),
('TASK-020', 4, 'Audit IAM permissions', '2026-09-26', 'active'),
-- user5
('TASK-021', 5, 'Plan onboarding for new hires', '2026-09-14', 'active'),
('TASK-022', 5, 'Organise team building event', '2026-09-23', 'active'),
('TASK-023', 5, 'Complete compliance training module', '2026-09-06', 'completed'),
('TASK-024', 5, 'Draft Q4 objectives and key results', '2026-09-20', 'active'),
('TASK-025', 5, 'Book travel for conference', '2026-09-10', 'completed'),
-- user6
('TASK-026', 6, 'Analyse customer feedback survey results', '2026-09-15', 'active'),
('TASK-027', 6, 'Create monthly performance report', '2026-09-11', 'active'),
('TASK-028', 6, 'Review SLA compliance metrics', '2026-09-18', 'completed'),
('TASK-029', 6, 'Update risk register', '2026-09-22', 'active'),
('TASK-030', 6, 'Prepare board meeting agenda', '2026-09-08', 'completed'),
-- user7
('TASK-031', 7, 'Refactor authentication module', '2026-09-16', 'active'),
('TASK-032', 7, 'Write integration tests for payments', '2026-09-12', 'active'),
('TASK-033', 7, 'Optimise slow database queries', '2026-09-20', 'active'),
('TASK-034', 7, 'Set up CI/CD pipeline for new service', '2026-09-09', 'completed'),
('TASK-035', 7, 'Document API versioning strategy', '2026-09-25', 'active'),
-- user8
('TASK-036', 8, 'Run penetration testing on staging', '2026-09-13', 'active'),
('TASK-037', 8, 'Review GDPR data retention policies', '2026-09-19', 'active'),
('TASK-038', 8, 'Patch vulnerable dependencies', '2026-09-07', 'completed'),
('TASK-039', 8, 'Conduct security awareness training', '2026-09-21', 'active'),
('TASK-040', 8, 'Update firewall rules for new services', '2026-09-10', 'completed'),
-- user9
('TASK-041', 9, 'Define acceptance criteria for sprint 12', '2026-09-14', 'active'),
('TASK-042', 9, 'Facilitate retrospective session', '2026-09-11', 'completed'),
('TASK-043', 9, 'Update product roadmap for Q4', '2026-09-23', 'active'),
('TASK-044', 9, 'Prioritise backlog with stakeholders', '2026-09-17', 'active'),
('TASK-045', 9, 'Write release notes for v2.4', '2026-09-08', 'completed'),
-- user10
('TASK-046', 10, 'Migrate legacy reports to new platform', '2026-09-16', 'active'),
('TASK-047', 10, 'Train team on new analytics tool', '2026-09-12', 'active'),
('TASK-048', 10, 'Build automated dashboard for KPIs', '2026-09-20', 'active'),
('TASK-049', 10, 'Validate data pipeline accuracy', '2026-09-09', 'completed'),
('TASK-050', 10, 'Present insights to leadership team', '2026-09-24', 'active');
