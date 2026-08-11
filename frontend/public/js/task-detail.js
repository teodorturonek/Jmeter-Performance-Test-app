/**
 * Task Detail Page Script
 */

let currentTask = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
  setupEventListeners();
  loadUserInfo();
  loadTaskDetail();
});

function checkAuthentication() {
  if (!apiClient.getSessionToken()) {
    window.location.href = 'index.html';
  }
}

function setupEventListeners() {
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Modal setup
  setupEditModal();
  setupUploadModal();
}

function setupEditModal() {
  const modal = document.getElementById('editModal');
  const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
  const form = document.getElementById('editForm');
  
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => modal.style.display = 'none');
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
  
  form.addEventListener('submit', handleUpdateTask);
}

function setupUploadModal() {
  const modal = document.getElementById('uploadModal');
  const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
  const form = document.getElementById('uploadForm');
  
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => modal.style.display = 'none');
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
  
  form.addEventListener('submit', handleUploadFile);
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

async function loadTaskDetail() {
  try {
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('id');
    
    if (!taskId) {
      showError('Task ID not found');
      return;
    }
    
    const response = await apiClient.getTask(taskId);
    currentTask = response.task;
    renderTaskDetail();
  } catch (err) {
    showError(err.message || 'Failed to load task');
  }
}

function renderTaskDetail() {
  const taskContent = document.getElementById('taskContent');
  
  const attachmentsHtml = currentTask.attachments?.length > 0 ? `
    <div class="attachments-section">
      <h2>Attachments (${currentTask.attachments.length})</h2>
      ${currentTask.attachments.map(att => `
        <div class="attachment-item">
          <div class="attachment-info">
            <div class="attachment-name">${escapeHtml(att.filename)}</div>
            <div class="attachment-meta">${formatFileSize(att.size)} • Uploaded ${formatDate(att.uploadedAt)}</div>
          </div>
          <div class="attachment-actions">
            <a href="${apiClient.downloadAttachment(currentTask.id, att.id)}" class="btn btn-primary" style="font-size: 12px;">Download</a>
          </div>
        </div>
      `).join('')}
      <button onclick="openUploadModal()" class="btn btn-secondary" style="width: 100%; margin-top: 12px;">+ Add File</button>
    </div>
  ` : `
    <div class="attachments-section">
      <h2>Attachments</h2>
      <p style="text-align: center; color: var(--secondary); padding: 20px;">No attachments yet</p>
      <button onclick="openUploadModal()" class="btn btn-secondary" style="width: 100%;">+ Add File</button>
    </div>
  `;
  
  taskContent.innerHTML = `
    <div class="task-detail-header">
      <div>
        <h1>${escapeHtml(currentTask.title)}</h1>
        <p style="color: var(--secondary); margin-top: 8px;">${escapeHtml(currentTask.description)}</p>
      </div>
      <div class="task-detail-actions">
        <button onclick="openEditModal()" class="btn btn-primary">Edit</button>
        <button onclick="handleDeleteTask()" class="btn btn-secondary">Delete</button>
      </div>
    </div>
    
    <div class="task-detail-info">
      <div class="info-row">
        <span class="info-label">Status</span>
        <span class="info-value">
          <span class="badge badge-${currentTask.status}">${currentTask.status}</span>
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">Priority</span>
        <span class="info-value">
          <span class="badge badge-${currentTask.priority}">${currentTask.priority}</span>
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">Due Date</span>
        <span class="info-value">${currentTask.dueDate ? formatDate(currentTask.dueDate) : 'No due date'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Created</span>
        <span class="info-value">${formatDate(currentTask.createdAt)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Last Updated</span>
        <span class="info-value">${formatDate(currentTask.updatedAt)}</span>
      </div>
    </div>
    
    ${attachmentsHtml}
  `;
}

function openEditModal() {
  document.getElementById('editTitle').value = currentTask.title;
  document.getElementById('editDesc').value = currentTask.description;
  document.getElementById('editPriority').value = currentTask.priority;
  document.getElementById('editDue').value = currentTask.dueDate || '';
  document.getElementById('editStatus').value = currentTask.status;
  
  document.getElementById('editModal').style.display = 'flex';
}

async function handleUpdateTask(e) {
  e.preventDefault();
  
  const updates = {
    title: document.getElementById('editTitle').value,
    description: document.getElementById('editDesc').value,
    priority: document.getElementById('editPriority').value,
    dueDate: document.getElementById('editDue').value || null,
    status: document.getElementById('editStatus').value
  };
  
  try {
    const response = await apiClient.updateTask(currentTask.id, updates);
    currentTask = response.task;
    renderTaskDetail();
    document.getElementById('editModal').style.display = 'none';
    showSuccess('Task updated successfully');
  } catch (err) {
    showError(err.message || 'Failed to update task');
  }
}

async function handleDeleteTask() {
  if (confirm('Are you sure you want to delete this task?')) {
    try {
      await apiClient.deleteTask(currentTask.id);
      showSuccess('Task deleted successfully');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (err) {
      showError(err.message || 'Failed to delete task');
    }
  }
}

function openUploadModal() {
  document.getElementById('uploadModal').style.display = 'flex';
}

async function handleUploadFile(e) {
  e.preventDefault();
  
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    showError('Please select a file');
    return;
  }
  
  try {
    await apiClient.uploadAttachment(currentTask.id, file);
    document.getElementById('uploadModal').style.display = 'none';
    fileInput.value = '';
    showSuccess('File uploaded successfully');
    loadTaskDetail();
  } catch (err) {
    showError(err.message || 'Failed to upload file');
  }
}

async function handleLogout() {
  try {
    await apiClient.logout();
    window.location.href = 'index.html';
  } catch (err) {
    apiClient.clearSessionToken();
    window.location.href = 'index.html';
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
  document.querySelector('.main-content').insertBefore(errorDiv, document.querySelector('#taskContent'));
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  document.querySelector('.main-content').insertBefore(successDiv, document.querySelector('#taskContent'));
  setTimeout(() => successDiv.remove(), 5000);
}
