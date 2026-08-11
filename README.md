# JMeter Performance Testing Training App

A full-stack Task Management web application designed specifically for **JMeter performance testing training**. Features a RESTful API backend and modern frontend with shared data, making it perfect for learning load testing concepts.

## 🎯 Features

### Backend API
- **Authentication**: Login, register, profile management
- **CRUD Operations**: Create, read, update, delete tasks
- **Search & Filtering**: Filter by status, priority, and search text
- **File Uploads**: Attach files to tasks
- **JSON Persistence**: Simple file-based data storage
- **Error Handling**: Proper HTTP status codes and error messages
- **CORS Support**: Ready for cross-origin requests

### Frontend Web Application
- **Login/Register**: User authentication with two demo accounts
- **Dashboard**: Task list with filters and search
- **Task Details**: Full task view with file attachments
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Synchronizes with backend API

### JMeter Training Ready
- Clear API endpoints with predictable response times
- Multiple user accounts for concurrent load testing
- File upload capability for stress testing
- Stateful session management (login required)
- Clean error responses for test verification

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 14+ (with npm)
- **JMeter** 5.5+ (for performance testing)
- **Mac/Linux/Windows** terminal

### 1. Setup Backend Server

```bash
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Seed database with demo data
npm run seed

# Start the server
npm start
```

Server runs on: `http://localhost:3001`

### 2. Serve Frontend

**Option A: Using Python (Simple)**
```bash
cd frontend

# Python 3
python3 -m http.server 3000

# Or Python 2
python -m SimpleHTTPServer 3000
```

**Option B: Using Node.js**
```bash
cd frontend
npm install -g http-server
http-server public -p 3000
```

Frontend runs on: `http://localhost:3000`

### 3. Access the App

1. Open browser: `http://localhost:3000`
2. Login with demo credentials:
   - **User 1**: alice@example.com / password123
   - **User 2**: bob@example.com / password456
3. Create, edit, delete tasks
4. Upload files to tasks

---

## 📊 Demo Credentials

Two pre-created demo users with tasks:

| Email | Password | Tasks |
|-------|----------|-------|
| alice@example.com | password123 | 8 tasks (various statuses) |
| bob@example.com | password456 | 4 tasks (prioritized) |

---

## 🔌 API Endpoints (for JMeter Testing)

### Authentication
```
POST   /api/auth/register        - Create new user
POST   /api/auth/login           - Login user (returns sessionToken)
POST   /api/auth/logout          - Logout user
GET    /api/auth/me              - Get current user profile
PUT    /api/auth/profile         - Update user profile
```

### Tasks
```
GET    /api/tasks                - List all user's tasks (with filtering)
POST   /api/tasks                - Create new task
GET    /api/tasks/:id            - Get task details
PUT    /api/tasks/:id            - Update task
DELETE /api/tasks/:id            - Delete task
```

### File Uploads
```
POST   /api/tasks/:id/upload     - Upload file to task
GET    /api/tasks/:id/attachments/:attachmentId - Download file
```

### Health
```
GET    /api/health               - Health check endpoint
```

---

## 🧪 Using JMeter for Load Testing

### Step 1: Create JMeter Test Plan

1. Open JMeter
2. Create a new Test Plan
3. Add a **Thread Group** (e.g., 10 threads, ramp-up 10 seconds)
4. Add **HTTP Request Samplers** for API endpoints

### Step 2: Sample Test Scenarios

#### Scenario 1: Login Test
```
HTTP Method: POST
URL: http://localhost:3001/api/auth/login
Body (JSON):
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Assertion**: Check for `sessionToken` in response

#### Scenario 2: Get Tasks
```
HTTP Method: GET
URL: http://localhost:3001/api/tasks
Headers: Authorization: Bearer ${SESSION_TOKEN}
```

Use a **JSON Extractor** to capture token from login response:
- JSON Path: `$.sessionToken`
- Variable Name: `SESSION_TOKEN`

#### Scenario 3: Create Task
```
HTTP Method: POST
URL: http://localhost:3001/api/tasks
Headers: Authorization: Bearer ${SESSION_TOKEN}
Body (JSON):
{
  "title": "Test Task - ${__time()}",
  "description": "Load testing task",
  "priority": "high",
  "status": "pending"
}
```

#### Scenario 4: Update Task
```
HTTP Method: PUT
URL: http://localhost:3001/api/tasks/${TASK_ID}
Headers: Authorization: Bearer ${SESSION_TOKEN}
Body (JSON):
{
  "status": "in-progress"
}
```

Use **JSON Extractor** to capture task ID from create response:
- JSON Path: `$.task.id`
- Variable Name: `TASK_ID`

#### Scenario 5: File Upload
```
HTTP Method: POST
URL: http://localhost:3001/api/tasks/${TASK_ID}/upload
Headers: Authorization: Bearer ${SESSION_TOKEN}
File: (select any file < 5MB)
Parameter Name: file
```

### Step 3: Add Listeners for Analysis

1. **Summary Report** - Overall statistics
2. **Response Time Graph** - Performance over time
3. **Aggregate Report** - Detailed breakdown
4. **View Results Tree** - Individual request details

### Step 4: Run Load Test

1. Configure:
   - Number of Threads (simulated users)
   - Ramp-up Time (how quickly to reach max threads)
   - Loop Count (repetitions)
   - Thinktime (delay between requests)

2. Start Test → Monitor Results → Analyze Performance

---

## 📁 Project Structure

```
JMeterTrainingApp/
│
├── server/                      # Node.js Backend
│   ├── src/
│   │   ├── server.js           # Express app entry point
│   │   ├── database.js         # JSON file persistence
│   │   ├── middleware.js       # Auth & validation
│   │   ├── seedData.js         # Demo data seeding
│   │   └── routes/
│   │       ├── auth.js         # Auth endpoints
│   │       └── tasks.js        # Task endpoints
│   ├── data/                    # JSON data files
│   ├── uploads/                 # Uploaded files storage
│   ├── package.json
│   └── .env.example
│
├── frontend/                    # Web Application
│   └── public/
│       ├── index.html          # Login page
│       ├── dashboard.html      # Task list page
│       ├── task-detail.html    # Task detail page
│       ├── css/
│       │   └── styles.css      # Styling
│       └── js/
│           ├── api.js          # API client
│           ├── auth.js         # Auth page logic
│           ├── dashboard.js    # Dashboard logic
│           └── task-detail.js  # Task detail logic
│
├── jmeter-scripts/             # JMeter test plans (to be added)
│   └── README.md               # JMeter testing guide
│
└── README.md                   # This file
```

---

## 🔐 Authentication Flow

1. **Register/Login**: User submits credentials → API returns `sessionToken`
2. **Token Storage**: Frontend stores token in `localStorage`
3. **API Requests**: All requests include `Authorization: Bearer ${token}` header
4. **Protected Routes**: Backend validates token on each request
5. **Logout**: Token is invalidated (cleared from localStorage)

### JMeter Consideration:
- Extract token from login response using **JSON Extractor**
- Use token in subsequent requests via **HTTP Header Manager**
- Variables persist across request chain

---

## 📈 Performance Testing Tips

### Load Scenarios
1. **Baseline Test**: 5 users, 1-minute ramp-up
2. **Stress Test**: 50 users, 2-minute ramp-up
3. **Soak Test**: 10 users, 30-minute duration
4. **Spike Test**: 100 users, instant ramp-up

### Key Metrics to Monitor
- **Response Time (avg, min, max)**
- **Throughput (requests/sec)**
- **Error Rate (%)**
- **95th/99th Percentile Response Time**

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Ensure login happens first, token is extracted and added to subsequent requests |
| 404 Not Found | Verify API endpoints and variable substitution (${TASK_ID}, etc.) |
| Timeout Errors | Increase thread ramp-up time, reduce number of threads |
| High Error Rate | Check server logs, verify request payloads |

---

## 🛠️ Customization

### Add More Test Data
Edit `server/src/seedData.js` and re-run:
```bash
npm run seed
```

### Change API Port
Edit `server/.env`:
```
PORT=3002  # Instead of 3001
```

### Add New Endpoints
1. Create route in `server/src/routes/`
2. Add to `server/src/server.js`
3. Use in JMeter test plan

### Modify Frontend
All frontend code is in `frontend/public/` - edit HTML/CSS/JS directly

---

## 📝 Sample JMeter Test Plan (XML)

A basic test plan template:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testname="Task Manager Load Test">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments"/>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testname="User Threads">
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <stringProp name="LoopController.loops">10</stringProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">5</stringProp>
        <stringProp name="ThreadGroup.ramp_time">10</stringProp>
      </ThreadGroup>
      <!-- Add HTTP samplers here -->
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill existing process
kill -9 <PID>
```

### Frontend can't reach API
- Check backend is running on `http://localhost:3001`
- Verify CORS settings in `server/src/server.js`
- Check browser console for errors (F12)

### Database/Data not persisting
- Check `server/data/` directory exists and is writable
- Verify file permissions: `chmod 755 server/data/`
- Re-seed data: `npm run seed`

### JMeter connection refused
- Verify backend is running: `curl http://localhost:3001/api/health`
- Check firewall isn't blocking port 3001
- Ensure URL in JMeter is exactly: `http://localhost:3001`

---

## 📚 JMeter Resources

- [Apache JMeter Official Docs](https://jmeter.apache.org/usermanual/)
- [JMeter Tutorial by BadoohBadooh](https://www.udemy.com/course/jmeter-from-zero-to-hero/)
- [JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)

---

## 📄 License

MIT

---

## 🎓 Learning Objectives

After using this app for JMeter training, you'll understand:

✅ How to create HTTP request samplers  
✅ How to extract values from responses (JSON Extractors)  
✅ How to manage sessions and tokens (Authorization headers)  
✅ How to create realistic load tests  
✅ How to analyze performance metrics  
✅ How to identify performance bottlenecks  
✅ How to simulate multiple concurrent users  
✅ How to test file upload functionality  

---

## 💡 Next Steps

1. **Start Simple**: Test single login endpoint first
2. **Add Variables**: Extract token and use in subsequent requests
3. **Build Scenarios**: Chain requests (login → get tasks → update task)
4. **Increase Load**: Gradually increase number of threads
5. **Analyze Results**: Use JMeter's reporting features
6. **Optimize**: Identify bottlenecks and suggest improvements

Happy Testing! 🚀
