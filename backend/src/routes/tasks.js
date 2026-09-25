const express = require('express');
const pool = require('../db');

const router = express.Router();

const PAGE_SIZE = 20;

async function generateTaskId(pool) {
  const result = await pool.query("SELECT nextval('task_id_seq')");
  return `TASK-${String(result.rows[0].nextval).padStart(3, '0')}`;
}

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: true, message: 'Search query is required' });
  try {
    const result = await pool.query(
      `SELECT task_id, description, due_date, status, created_at FROM tasks 
       WHERE user_id = $1 AND (task_id ILIKE $2 OR description ILIKE $2) ORDER BY task_id`,
      [req.user.id, `%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Search tasks error:', err);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  try {
    const result = await pool.query(
      'SELECT task_id, description, due_date, status, created_at FROM tasks WHERE user_id = $1 ORDER BY task_id LIMIT $2 OFFSET $3',
      [req.user.id, PAGE_SIZE, offset]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List tasks error:', err);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  const taskId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT task_id, description, due_date, status, created_at FROM tasks WHERE task_id = $1 AND user_id = $2',
      [taskId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const { description, due_date, status } = req.body;

  if (!description || !due_date) {
    return res.status(400).json({ error: true, message: 'Description and due date are required' });
  }

  if (description.length > 200) {
    return res.status(400).json({ error: true, message: 'Description must be 200 characters or less' });
  }

  const taskStatus = status === 'completed' ? 'completed' : 'active';

  try {
    const taskId = await generateTaskId(pool);
    const result = await pool.query(
      'INSERT INTO tasks (task_id, user_id, description, due_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING task_id, description, due_date, status, created_at',
      [taskId, req.user.id, description, due_date, taskStatus]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  const taskId = req.params.id;

  const { description, due_date, status } = req.body;

  if (!description || !due_date) {
    return res.status(400).json({ error: true, message: 'Description and due date are required' });
  }

  if (description.length > 200) {
    return res.status(400).json({ error: true, message: 'Description must be 200 characters or less' });
  }

  if (status !== 'active' && status !== 'completed') {
    return res.status(400).json({ error: true, message: 'Status must be active or completed' });
  }

  try {
    const result = await pool.query(
      'UPDATE tasks SET description = $1, due_date = $2, status = $3 WHERE task_id = $4 AND user_id = $5 RETURNING task_id, description, due_date, status, created_at',
      [description, due_date, status, taskId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const taskId = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE task_id = $1 AND user_id = $2 RETURNING task_id',
      [taskId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
});

module.exports = router;
