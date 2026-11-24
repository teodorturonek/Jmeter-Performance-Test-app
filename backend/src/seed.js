const bcrypt = require('bcryptjs');

const SEED_USERS = [
  { username: 'user1',  password: 'password1'  },
  { username: 'user2',  password: 'password2'  },
  { username: 'user3',  password: 'password3'  },
  { username: 'user4',  password: 'password4'  },
  { username: 'user5',  password: 'password5'  },
  { username: 'user6',  password: 'password6'  },
  { username: 'user7',  password: 'password7'  },
  { username: 'user8',  password: 'password8'  },
  { username: 'user9',  password: 'password9'  },
  { username: 'user10', password: 'password10' },
];

const SEED_TASKS = [
  ['Review quarterly budget report', '2026-09-15', 'active'],
  ['Schedule team meeting for sprint planning', '2026-09-10', 'active'],
  ['Update project documentation', '2026-09-20', 'completed'],
  ['Prepare presentation for stakeholders', '2026-09-25', 'active'],
  ['Submit expense claims', '2026-09-05', 'completed'],
  ['Fix login page styling issues', '2026-09-12', 'active'],
  ['Write unit tests for API endpoints', '2026-09-18', 'active'],
  ['Deploy staging environment', '2026-09-08', 'completed'],
  ['Review pull request from team lead', '2026-09-14', 'active'],
  ['Update dependencies to latest versions', '2026-09-22', 'active'],
  ['Design new dashboard layout', '2026-09-16', 'active'],
  ['Conduct user research interviews', '2026-09-11', 'completed'],
  ['Create wireframes for mobile app', '2026-09-19', 'active'],
  ['Prepare design system components', '2026-09-24', 'active'],
  ['Review accessibility audit findings', '2026-09-07', 'completed'],
  ['Set up monitoring alerts', '2026-09-13', 'active'],
  ['Migrate database to new cluster', '2026-09-21', 'active'],
  ['Write runbook for incident response', '2026-09-09', 'completed'],
  ['Configure backup automation', '2026-09-17', 'active'],
  ['Audit IAM permissions', '2026-09-26', 'active'],
  ['Plan onboarding for new hires', '2026-09-14', 'active'],
  ['Organise team building event', '2026-09-23', 'active'],
  ['Complete compliance training module', '2026-09-06', 'completed'],
  ['Draft Q4 objectives and key results', '2026-09-20', 'active'],
  ['Book travel for conference', '2026-09-10', 'completed'],
  // user6
  ['Analyse customer feedback survey results', '2026-09-15', 'active'],
  ['Create monthly performance report', '2026-09-11', 'active'],
  ['Review SLA compliance metrics', '2026-09-18', 'completed'],
  ['Update risk register', '2026-09-22', 'active'],
  ['Prepare board meeting agenda', '2026-09-08', 'completed'],
  // user7
  ['Refactor authentication module', '2026-09-16', 'active'],
  ['Write integration tests for payments', '2026-09-12', 'active'],
  ['Optimise slow database queries', '2026-09-20', 'active'],
  ['Set up CI/CD pipeline for new service', '2026-09-09', 'completed'],
  ['Document API versioning strategy', '2026-09-25', 'active'],
  // user8
  ['Run penetration testing on staging', '2026-09-13', 'active'],
  ['Review GDPR data retention policies', '2026-09-19', 'active'],
  ['Patch vulnerable dependencies', '2026-09-07', 'completed'],
  ['Conduct security awareness training', '2026-09-21', 'active'],
  ['Update firewall rules for new services', '2026-09-10', 'completed'],
  // user9
  ['Define acceptance criteria for sprint 12', '2026-09-14', 'active'],
  ['Facilitate retrospective session', '2026-09-11', 'completed'],
  ['Update product roadmap for Q4', '2026-09-23', 'active'],
  ['Prioritise backlog with stakeholders', '2026-09-17', 'active'],
  ['Write release notes for v2.4', '2026-09-08', 'completed'],
  // user10
  ['Migrate legacy reports to new platform', '2026-09-16', 'active'],
  ['Train team on new analytics tool', '2026-09-12', 'active'],
  ['Build automated dashboard for KPIs', '2026-09-20', 'active'],
  ['Validate data pipeline accuracy', '2026-09-09', 'completed'],
  ['Present insights to leadership team', '2026-09-24', 'active'],

async function resetAndReseed(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM tasks');
    await client.query('DELETE FROM users');
    await client.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE task_id_seq RESTART WITH 1");

    for (const user of SEED_USERS) {
      const hash = await bcrypt.hash(user.password, 10);
      await client.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
        [user.username, hash]
      );
    }

    for (let i = 0; i < SEED_TASKS.length; i++) {
      const userId = Math.floor(i / 5) + 1;
      const taskId = `TASK-${String(i + 1).padStart(3, '0')}`;
      const [description, dueDate, status] = SEED_TASKS[i];
      await client.query(
        'INSERT INTO tasks (task_id, user_id, description, due_date, status) VALUES ($1, $2, $3, $4, $5)',
        [taskId, userId, description, dueDate, status]
      );
    }

    await client.query("ALTER SEQUENCE task_id_seq RESTART WITH 51");

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { resetAndReseed };
