---

## Connecting to PostgreSQL (VS Code)

### Step 1: Install Extension

Install **PostgreSQL**  VS Code extensions:

### Step 2: Connect using the below details

| Setting | Value |
|---------|-------|
| Host | `127.0.0.1` |
| Port | `5432` |
| Database | `tasks_db` |
| Username | `tasks_user` |
| Password | `tasks_pass` |

> ⚠️ Use `127.0.0.1` instead of `localhost` to avoid DNS resolution issues.


### Sample Queries

```sql
-- View all users
SELECT * FROM users;

-- View all tasks
SELECT * FROM tasks;

-- View tasks for a specific user
SELECT t.task_id, t.description, t.status, u.username 
FROM tasks t 
JOIN users u ON t.user_id = u.id 
WHERE u.username = 'user1';

-- Search tasks by description
SELECT * FROM tasks 
WHERE description ILIKE '%budget%';

-- Count tasks by status
SELECT status, COUNT(*) 
FROM tasks 
GROUP BY status;

-- View task with user info
SELECT 
    t.task_id,
    t.description,
    t.due_date,
    t.status,
    u.username
FROM tasks t
JOIN users u ON t.user_id = u.id
ORDER BY t.task_id;
