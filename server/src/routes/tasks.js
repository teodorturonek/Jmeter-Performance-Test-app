const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const db = require('../database');
const { authMiddleware } = require('../middleware');

const router = express.Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../../uploads');
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|txt|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Ensure uploads directory exists
(async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
})();

/**
 * GET /api/tasks
 * Get all tasks for authenticated user with optional filtering
 */
router.get('/', authMiddleware, (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (search) filters.search = search;
    
    const tasks = db.getTasksByUserId(req.user.id, filters);
    
    // Include attachments for each task
    const tasksWithAttachments = tasks.map(task => ({
      ...task,
      attachments: db.getAttachmentsByTaskId(task.id)
    }));
    
    res.json({
      total: tasksWithAttachments.length,
      tasks: tasksWithAttachments
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;
    
    // Validation
    if (!title) {
      const err = new Error('Title is required');
      err.status = 400;
      throw err;
    }
    
    const validPriorities = ['low', 'medium', 'high'];
    const validStatuses = ['pending', 'in-progress', 'completed'];
    
    if (priority && !validPriorities.includes(priority)) {
      const err = new Error('Invalid priority');
      err.status = 400;
      throw err;
    }
    
    if (status && !validStatuses.includes(status)) {
      const err = new Error('Invalid status');
      err.status = 400;
      throw err;
    }
    
    const task = await db.createTask({
      userId: req.user.id,
      title,
      description: description || '',
      priority: priority || 'medium',
      status: status || 'pending',
      dueDate: dueDate || null
    });
    
    res.status(201).json({
      message: 'Task created successfully',
      task: {
        ...task,
        attachments: []
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/tasks/:taskId
 * Get a specific task
 */
router.get('/:taskId', authMiddleware, (req, res, next) => {
  try {
    const task = db.getTaskById(req.params.taskId);
    
    if (!task) {
      const err = new Error('Task not found');
      err.status = 404;
      throw err;
    }
    
    if (task.userId !== req.user.id) {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }
    
    const attachments = db.getAttachmentsByTaskId(task.id);
    
    res.json({
      task: {
        ...task,
        attachments
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/tasks/:taskId
 * Update a task
 */
router.put('/:taskId', authMiddleware, async (req, res, next) => {
  try {
    const task = db.getTaskById(req.params.taskId);
    
    if (!task) {
      const err = new Error('Task not found');
      err.status = 404;
      throw err;
    }
    
    if (task.userId !== req.user.id) {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }
    
    const { title, description, priority, status, dueDate } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) updates.status = status;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    
    const updatedTask = await db.updateTask(req.params.taskId, updates);
    const attachments = db.getAttachmentsByTaskId(updatedTask.id);
    
    res.json({
      message: 'Task updated successfully',
      task: {
        ...updatedTask,
        attachments
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/tasks/:taskId
 * Delete a task
 */
router.delete('/:taskId', authMiddleware, async (req, res, next) => {
  try {
    const task = db.getTaskById(req.params.taskId);
    
    if (!task) {
      const err = new Error('Task not found');
      err.status = 404;
      throw err;
    }
    
    if (task.userId !== req.user.id) {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }
    
    await db.deleteTask(req.params.taskId);
    
    res.json({
      message: 'Task deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/tasks/:taskId/upload
 * Upload a file attachment to a task
 */
router.post('/:taskId/upload', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    const task = db.getTaskById(req.params.taskId);
    
    if (!task) {
      const err = new Error('Task not found');
      err.status = 404;
      throw err;
    }
    
    if (task.userId !== req.user.id) {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }
    
    if (!req.file) {
      const err = new Error('No file provided');
      err.status = 400;
      throw err;
    }
    
    // Store attachment metadata
    const attachment = await db.addAttachment(req.params.taskId, {
      filename: req.file.originalname,
      filepath: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
    
    res.status(201).json({
      message: 'File uploaded successfully',
      attachment
    });
  } catch (err) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      fs.unlink(path.join(uploadsDir, req.file.filename)).catch(console.error);
    }
    next(err);
  }
});

/**
 * GET /api/tasks/:taskId/attachments/:attachmentId
 * Download an attachment
 */
router.get('/:taskId/attachments/:attachmentId', authMiddleware, async (req, res, next) => {
  try {
    const task = db.getTaskById(req.params.taskId);
    
    if (!task) {
      const err = new Error('Task not found');
      err.status = 404;
      throw err;
    }
    
    if (task.userId !== req.user.id) {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }
    
    const attachments = db.getAttachmentsByTaskId(req.params.taskId);
    const attachment = attachments.find(a => a.id === req.params.attachmentId);
    
    if (!attachment) {
      const err = new Error('Attachment not found');
      err.status = 404;
      throw err;
    }
    
    const filePath = path.join(uploadsDir, attachment.filepath);
    res.download(filePath, attachment.filename);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
