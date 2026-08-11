# API Endpoints Reference

**Base URL**: `http://localhost:3001/api`

---

## Authentication Endpoints

### Register New User
```
POST /api/auth/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```
**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

---

### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "message": "Login successful",
  "sessionToken": "base64-encoded-token",
  "user": {
    "id": "uuid",
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "role": "user"
  }
}
```
**⚠️ JMeter Tip**: Extract `sessionToken` using JSON Extractor with path `$.sessionToken` and store in variable `SESSION_TOKEN`

---

### Logout
```
POST /api/auth/logout
```
**Headers:**
```
Authorization: Bearer ${SESSION_TOKEN}
```
**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### Get Current User Profile
```
GET /api/auth/me
```
**Headers:**
```
Authorization: Bearer ${SESSION_TOKEN}
```
**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Update User Profile
```
PUT /api/auth/profile
```
**Headers:**
```
Authorization: Bearer ${SESSION_TOKEN}
```
**Body:**
```json
{
  "name": "New Name"
}
```
**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "alice@example.com",
    "name": "New Name",
    "role": "user"
  }
}
```

---

## Task Endpoints

### List All Tasks (with filtering)
```
GET /api/tasks
```
**Headers:**
```
Authorization: Bearer ${SESSION_TOKEN}
```
**Query Parameters:**
- `status` - Filter by status (pending, in-progress, completed)
- `priority` - Filter by priority (low, medium, high)
- `search` - Search in title and description

**Example:**
```
GET /api/tasks?status=pending&priority=high&search=jmeter
```

**Response:**
```json
{
  "total": 3,
  "tasks": [
    {
      "id": "task-uuid-1",
      "userId": "user-uuid",
      "title": "Complete JMeter training",
      "description": "Training task for performance testing",
      "priority": "high",
      "status": "pending",
      "dueDate": "2024-12-31",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "attachments": []
    }
  ]
}
```

---

### Create Task
```
POST /api/tasks
```
**Headers:**
```
Authorization: Bearer ${SESSION_TOKEN}
```
**Body:**
```json
{
  "title": "Test Task - ${__time()}",
  "description": "Load testing task",
  "priority": "high",
  "status": "pending",
  "dueDate": "2024-12-31"
}
```
**Response:**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "task-uuid",
    "userId": "user-uuid",
    "title": "Test Task - 1705324200000",
    "description": "Load testing task",
    "priority": "high",
    "status": "pending",
    "dueDate": "2024-12-31",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "attachments": []
  }
}
```
**⚠️ JMeter Tip**: Extract task ID using JSON Extractor with path `$.task.id` and store in variable `TASK_ID`

---

### Get Task Details
```
GET /api/tasks/:id
```
**Headers:**
```
Authorization: Bearer ${SESSION_TOKEN}
```
**Example:**
```
GET /api/tasks/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "task": {
    "id": "task-uuid",
    "userId": "user-uuid",
    "title": "Complete JMeter training",
    "description": "Training task",
    "priority": "high",
    "status": "in-progress",
    "dueDate": "2024-12-31",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z",
    "attachments": [
      {
        "id": "attachment-uuid",
        "filename": "training.pdf",
        "mimeType": "application/pdf",
        "size": 2048,
        "uploadedAt": "2024-01-15T10:45:00.000Z"
      }
    ]
  }
}
```

---

### Update Task
```
PUT /api/tasks/:id
```
**Headers:**
```
Authorization: Bearer ${SESSION_TOKEN}
```
**Body (all fields optional):**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "priority": "medium",
  "status": "in-progress",
  "dueDate": "2024-12-25"
}
```
**Response:**
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": "task-uuid",
    "userId": "user-uuid",
    "title": "Updated Task Title",
    "description": "Updated description",
    "priority": "medium",
    "status": "in-progress",
    "dueDate": "2024-12-25",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:05:00.000Z",
    "attachments": []
  }
}
```

---

### Delete Task
```
DELETE /api/tasks/:id
```
**Headers:**
```
Authorization: Bearer ${SESSION_TOKEN}
```
**Example:**
```
DELETE /api/tasks/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

---

## File Upload & Attachment Endpoints

### Upload File to Task
```
POST /api/tasks/:id/upload
```
**Headers:**
```
Authorization: Bearer ${SESSION_TOKEN}
Content-Type: multipart/form-data
```
**Body:**
- Form field name: `file`
- File: (binary file content)

**Allowed file types**: PDF, images (JPEG, PNG), documents (DOC, DOCX)  
**Max file size**: 5 MB

**Example Response:**
```json
{
  "message": "File uploaded successfully",
  "attachment": {
    "id": "attachment-uuid",
    "taskId": "task-uuid",
    "filename": "test-document.pdf",
    "filepath": "uploads/abc123xyz",
    "mimeType": "application/pdf",
    "size": 102400,
    "uploadedAt": "2024-01-15T11:10:00.000Z"
  }
}
```

---

### Download File (Attachment)
```
GET /api/tasks/:taskId/attachments/:attachmentId
```
**Headers:**
```
Authorization: Bearer ${SESSION_TOKEN}
```
**Example:**
```
GET /api/tasks/550e8400-e29b-41d4-a716-446655440000/attachments/660f9411-f30c-52e5-b827-557766551111
```

**Response:** Binary file content (direct download)

---

## Health Check Endpoint

### API Health Check
```
GET /api/health
```
**No authentication required**

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T11:15:00.000Z",
  "uptime": 3600.5
}
```

---

## Demo Credentials for Testing

| Email | Password | Tasks |
|-------|----------|-------|
| alice@example.com | password123 | 8 tasks |
| bob@example.com | password456 | 4 tasks |

---

## Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## JMeter Variables Quick Reference

| Variable | Source | Example |
|----------|--------|---------|
| `${SESSION_TOKEN}` | Login response → `$.sessionToken` | `dXNlcjEyMzp...` |
| `${TASK_ID}` | Create/Get task → `$.task.id` | `550e8400-e29b...` |
| `${__time()}` | Built-in function | `1705324200000` |
| `${ATTACHMENT_ID}` | Upload response → `$.attachment.id` | `660f9411-f30c...` |

---

## Sample JMeter Test Flow

1. **Login** → Extract `SESSION_TOKEN`
2. **Get Tasks** → Use `SESSION_TOKEN` in header
3. **Create Task** → Extract `TASK_ID`
4. **Upload File** → Use `TASK_ID` and `SESSION_TOKEN`
5. **Update Task** → Use `TASK_ID` and `SESSION_TOKEN`
6. **Logout** → Clear session

---

For detailed JMeter usage examples, see [README.md](../README.md#using-jmeter-for-load-testing)
