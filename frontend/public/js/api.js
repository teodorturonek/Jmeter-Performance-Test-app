/**
 * API Client Module
 * Handles all API calls to the backend server
 */

const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.sessionToken = localStorage.getItem('sessionToken');
  }
  
  setSessionToken(token) {
    this.sessionToken = token;
    localStorage.setItem('sessionToken', token);
  }
  
  getSessionToken() {
    return this.sessionToken;
  }
  
  clearSessionToken() {
    this.sessionToken = null;
    localStorage.removeItem('sessionToken');
  }
  
  /**
   * Make a request to the API
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (this.sessionToken && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.error || 'An error occurred',
          data
        };
      }
      
      return data;
    } catch (error) {
      if (error.status === 401) {
        // Unauthorized - clear token and redirect to login
        this.clearSessionToken();
        window.location.href = 'index.html';
      }
      throw error;
    }
  }
  
  // ====== Auth Endpoints ======
  
  async register(email, password, name) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
      skipAuth: true
    });
  }
  
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true
    });
  }
  
  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearSessionToken();
    }
  }
  
  async getProfile() {
    return this.request('/auth/me');
  }
  
  async updateProfile(name) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
  }
  
  // ====== Task Endpoints ======
  
  async getTasks(filters = {}) {
    let query = new URLSearchParams();
    if (filters.status) query.append('status', filters.status);
    if (filters.priority) query.append('priority', filters.priority);
    if (filters.search) query.append('search', filters.search);
    
    const queryString = query.toString();
    const endpoint = `/tasks${queryString ? '?' + queryString : ''}`;
    
    return this.request(endpoint);
  }
  
  async getTask(taskId) {
    return this.request(`/tasks/${taskId}`);
  }
  
  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }
  
  async updateTask(taskId, updates) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }
  
  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }
  
  async uploadAttachment(taskId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request(`/tasks/${taskId}/upload`, {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type to let browser set it
    });
  }
  
  async downloadAttachment(taskId, attachmentId) {
    return `${API_BASE_URL}/tasks/${taskId}/attachments/${attachmentId}`;
  }
  
  // ====== Health Check ======
  
  async healthCheck() {
    try {
      return await this.request('/health', { skipAuth: true });
    } catch (err) {
      return null;
    }
  }
}

// Create global API client instance
const apiClient = new ApiClient();

// Export for Node.js if used
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiClient;
}
