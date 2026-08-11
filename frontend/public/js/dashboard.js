/**
 * Dashboard Page Script
 */

let allTasks = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
  setupEventListeners();
  loadUserInfo();
  loadTasks();
});

function checkAuthentication() {
  if (!apiClient.getSessionToken()) {
    window.location.href = 'index.html';
  }
}

function setupEventListeners() {
  // Navigation filters
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = item.dataset.filter;
      if (filter) {
        currentFilter = filter;
        applyFilters();
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });
  
  // New task button
  document.getElementById('newTaskBtn').addEventListener('click', openNewTaskModal);
  
  // Search and filter
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('priorityFilter').addEventListener('change', applyFilters);
  
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Modal
  setupTaskModal();
}

function setupTaskModal() {
  const modal = document.getElementById('taskModal');
  const closeButtons = document.querySelectorAll('.modal-close, .modal-close-btn');
  const form = document.getElementById('taskForm');
  
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => modal.style.display = 'none');
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
  
  form.addEventListener('submit', handleCreateTask);
}

async function loadUserInfo() {
  try {
    const response = await apiClient.getProfile();
    const user = response.user;
    
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
  } catch (err) {
    console.error('Failed to load user info:', err);
  }
}

async function loadTasks() {
  try {
    const response = await apiClient.getTasks();
    allTasks = response.tasks || [];
    applyFilters();
  } catch (err) {
    showError('Failed to load tasks');
  }
}

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const priorityFilter = document.getElementById('priorityFilter').value;
  
  let filtered = allTasks;
  
  // Status filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(t => t.status === currentFilter);
  }
  
  // Priority filter
  if (priorityFilter) {
    filtered = filtered.filter(t => t.priority === priorityFilter);
  }
  
  // Search filter
  if (searchTerm) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(searchTerm) ||
      (t.description && t.description.toLowerCase().includes(searchTerm))
    );
  }
  
  renderTaskList(filtered);
}

function renderTaskList(tasks) {
  const taskList = document.getElementById('taskList');
  
  if (tasks.length === 0) {
    taskList.innerHTML = '<p class="loading">No tasks found</p>';
    return;
  }
  
  taskList.innerHTML = tasks.map(task => `
    <div class="task-card" onclick="viewTask('${task.id}')">
      <div class="task-card-content">
        <h3>${escapeHtml(task.title)}</h3>
        <p>${escapeHtml(task.description || '(No description)')}</p>
        <div class="task-meta">
          <span class="badge badge-${task.priority}">${task.priority}</span>
          <span class="badge badge-${task.status}">${task.status}</span>
          ${task.dueDate ? `<span class="badge" style="background: #e7e8ea; color: #41464b;">${formatDate(task.dueDate)}</span>` : ''}
          ${task.attachments && task.attachments.length > 0 ? `<span class="badge" style="background: #e8f4f8; color: #0c5460;">📎 ${task.attachments.length}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function openNewTaskModal() {
  document.getElementById('modalTitle').textContent = 'Create New Task';
  document.getElementById('taskForm').reset();
  document.getElementById('taskForm').dataset.mode = 'create';
  document.getElementById('taskModal').style.display = 'flex';
}

async function handleCreateTask(e) {
  e.preventDefault();
  
  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDesc').value;
  const priority = document.getElementById('taskPriority').value;
  const dueDate = document.getElementById('taskDue').value;
  const status = document.getElementById('taskStatus').value;
  
  try {
    await apiClient.createTask({
      title,
      description,
      priority,
      dueDate,
      status
    });
    
    document.getElementById('taskModal').style.display = 'none';
    showSuccess('Task created successfully');
    loadTasks();
  } catch (err) {
    showError(err.message || 'Failed to create task');
  }
}

function viewTask(taskId) {
  window.location.href = `task-detail.html?id=${taskId}`;
}

async function handleLogout() {
  try {
    await apiClient.logout();
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Logout error:', err);
    apiClient.clearSessionToken();
    window.location.href = 'index.html';
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.querySelector('.main-content').insertBefore(errorDiv, document.querySelector('.search-bar'));
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  document.querySelector('.main-content').insertBefore(successDiv, document.querySelector('.search-bar'));
  setTimeout(() => successDiv.remove(), 5000);
}
