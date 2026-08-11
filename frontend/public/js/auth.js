/**
 * Authentication Page Script
 */

let isLoginMode = true;

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkAlreadyLoggedIn();
});

function setupEventListeners() {
  const authForm = document.getElementById('authForm');
  const toggleBtn = document.getElementById('toggleBtn');
  
  authForm.addEventListener('submit', handleFormSubmit);
  toggleBtn.addEventListener('click', toggleAuthMode);
}

function checkAlreadyLoggedIn() {
  if (apiClient.getSessionToken()) {
    window.location.href = 'dashboard.html';
  }
}

function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  
  const formTitle = document.getElementById('formTitle');
  const loginInputs = document.getElementById('loginInputs');
  const registerInputs = document.getElementById('registerInputs');
  const toggleText = document.getElementById('toggleText');
  const toggleBtn = document.getElementById('toggleBtn');
  
  if (isLoginMode) {
    formTitle.textContent = 'Login';
    loginInputs.style.display = 'block';
    registerInputs.style.display = 'none';
    toggleText.textContent = "Don't have an account?";
    toggleBtn.textContent = 'Sign up';
  } else {
    formTitle.textContent = 'Create Account';
    loginInputs.style.display = 'none';
    registerInputs.style.display = 'block';
    toggleText.textContent = 'Already have an account?';
    toggleBtn.textContent = 'Login';
  }
  
  document.getElementById('authForm').reset();
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  try {
    if (isLoginMode) {
      await handleLogin();
    } else {
      await handleRegister();
    }
  } catch (err) {
    showError(err.message || 'An error occurred');
  }
}

async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await apiClient.login(email, password);
    
    // Store token and redirect
    apiClient.setSessionToken(response.sessionToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    window.location.href = 'dashboard.html';
  } catch (err) {
    showError(err.message || 'Login failed');
  }
}

async function handleRegister() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }
  
  try {
    await apiClient.register(email, password, name);
    showSuccess('Account created successfully! Please login.');
    
    // Switch to login mode
    isLoginMode = true;
    document.getElementById('authForm').reset();
    document.getElementById('email').value = email;
    toggleAuthMode();
  } catch (err) {
    showError(err.message || 'Registration failed');
  }
}

function showError(message) {
  // Remove existing messages
  document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  const formSection = document.querySelector('.form-section');
  formSection.insertBefore(errorDiv, formSection.firstChild);
  
  // Remove after 5 seconds
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
  // Remove existing messages
  document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
  
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  
  const formSection = document.querySelector('.form-section');
  formSection.insertBefore(successDiv, formSection.firstChild);
}
