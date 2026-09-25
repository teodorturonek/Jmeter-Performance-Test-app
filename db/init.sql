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
CREATE SEQUENCE task_id_seq START 26;

-- Seed users (passwords: password1, password2, ... password5)
INSERT INTO users (username, password_hash) VALUES
('user1', crypt('password1', gen_salt('bf', 10))),
('user2', crypt('password2', gen_salt('bf', 10))),
('user3', crypt('password3', gen_salt('bf', 10))),
('user4', crypt('password4', gen_salt('bf', 10))),
('user5', crypt('password5', gen_salt('bf', 10)));

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
('TASK-025', 5, 'Book travel for conference', '2026-09-10', 'completed');
