const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../data');

// Database structure
const db = {
  users: [],
  tasks: [],
  attachments: []
};

/**
 * Initialize database - load data from JSON files
 */
async function initialize() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Load users
    try {
      const usersData = await fs.readFile(path.join(DATA_DIR, 'users.json'), 'utf8');
      db.users = JSON.parse(usersData);
      console.log(`✓ Loaded ${db.users.length} users`);
    } catch (err) {
      console.log('No existing users data, starting fresh');
      db.users = [];
    }
    
    // Load tasks
    try {
      const tasksData = await fs.readFile(path.join(DATA_DIR, 'tasks.json'), 'utf8');
      db.tasks = JSON.parse(tasksData);
      console.log(`✓ Loaded ${db.tasks.length} tasks`);
    } catch (err) {
      console.log('No existing tasks data, starting fresh');
      db.tasks = [];
    }
    
    // Load attachments metadata
    try {
      const attachmentsData = await fs.readFile(path.join(DATA_DIR, 'attachments.json'), 'utf8');
      db.attachments = JSON.parse(attachmentsData);
      console.log(`✓ Loaded ${db.attachments.length} attachments`);
    } catch (err) {
      console.log('No existing attachments data, starting fresh');
      db.attachments = [];
    }
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

/**
 * Persist users to disk
 */
async function saveUsers() {
  try {
    await fs.writeFile(
      path.join(DATA_DIR, 'users.json'),
      JSON.stringify(db.users, null, 2)
    );
  } catch (err) {
    console.error('Error saving users:', err);
    throw err;
  }
}

/**
 * Persist tasks to disk
 */
async function saveTasks() {
  try {
    await fs.writeFile(
      path.join(DATA_DIR, 'tasks.json'),
      JSON.stringify(db.tasks, null, 2)
    );
  } catch (err) {
    console.error('Error saving tasks:', err);
    throw err;
  }
}

/**
 * Persist attachments metadata to disk
 */
async function saveAttachments() {
  try {
    await fs.writeFile(
      path.join(DATA_DIR, 'attachments.json'),
      JSON.stringify(db.attachments, null, 2)
    );
  } catch (err) {
    console.error('Error saving attachments:', err);
    throw err;
  }
}

// User operations
function getUserById(userId) {
  return db.users.find(u => u.id === userId);
}

function getUserByEmail(email) {
  return db.users.find(u => u.email === email);
}

async function createUser(userData) {
  const user = {
    id: uuidv4(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.users.push(user);
  await saveUsers();
  return user;
}

async function updateUser(userId, updates) {
  const user = getUserById(userId);
  if (!user) throw new Error('User not found');
  
  Object.assign(user, updates, { updatedAt: new Date().toISOString() });
  await saveUsers();
  return user;
}

// Task operations
function getTaskById(taskId) {
  return db.tasks.find(t => t.id === taskId);
}

function getTasksByUserId(userId, filters = {}) {
  let tasks = db.tasks.filter(t => t.userId === userId);
  
  if (filters.status) {
    tasks = tasks.filter(t => t.status === filters.status);
  }
  
  if (filters.priority) {
    tasks = tasks.filter(t => t.priority === filters.priority);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(searchLower) ||
      (t.description && t.description.toLowerCase().includes(searchLower))
    );
  }
  
  return tasks;
}

async function createTask(taskData) {
  const task = {
    id: uuidv4(),
    ...taskData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: []
  };
  db.tasks.push(task);
  await saveTasks();
  return task;
}

async function updateTask(taskId, updates) {
  const task = getTaskById(taskId);
  if (!task) throw new Error('Task not found');
  
  Object.assign(task, updates, { updatedAt: new Date().toISOString() });
  await saveTasks();
  return task;
}

async function deleteTask(taskId) {
  const index = db.tasks.findIndex(t => t.id === taskId);
  if (index === -1) throw new Error('Task not found');
  
  const task = db.tasks.splice(index, 1)[0];
  
  // Remove associated attachments
  db.attachments = db.attachments.filter(a => a.taskId !== taskId);
  
  await saveTasks();
  await saveAttachments();
  return task;
}

// Attachment operations
async function addAttachment(taskId, fileInfo) {
  const attachment = {
    id: uuidv4(),
    taskId,
    ...fileInfo,
    uploadedAt: new Date().toISOString()
  };
  db.attachments.push(attachment);
  await saveAttachments();
  return attachment;
}

function getAttachmentsByTaskId(taskId) {
  return db.attachments.filter(a => a.taskId === taskId);
}

module.exports = {
  initialize,
  
  // User operations
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  
  // Task operations
  getTaskById,
  getTasksByUserId,
  createTask,
  updateTask,
  deleteTask,
  
  // Attachment operations
  addAttachment,
  getAttachmentsByTaskId,
  
  // Direct access to in-memory data (read-only)
  getUsers: () => [...db.users],
  getTasks: () => [...db.tasks],
  getAttachments: () => [...db.attachments]
};
