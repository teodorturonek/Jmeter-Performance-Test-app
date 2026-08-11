# JMeter Performance Testing Scripts

This directory contains JMeter test plans and guides for performance testing the Task Manager API.

## 📋 Contents

- `README.md` - Detailed JMeter testing guide (see main README.md)

## 🚀 Getting Started with JMeter

### Installation
1. Download JMeter from [apache.org/jmeter](https://jmeter.apache.org/download_jmeter.cgi)
2. Extract to your machine
3. Run: `./jmeter` (or `jmeter.bat` on Windows)

### Quick Test

1. **Create Thread Group**
   - Right-click Test Plan → Add → Threads → Thread Group
   - Set 5 threads, 10 second ramp-up

2. **Add HTTP Sampler**
   - Right-click Thread Group → Add → Sampler → HTTP Request
   - Set URL: `http://localhost:3001/api/health`
   - Method: GET

3. **Add Listener**
   - Right-click Thread Group → Add → Listener → View Results Tree

4. **Run Test**
   - Click green Play button
   - Watch requests execute in real-time

## 📝 Common Test Scenarios

### 1. Authentication Flow
1. Login (extract token)
2. Get user profile
3. Logout

### 2. Task CRUD Operations
1. Create task
2. List tasks (with filtering)
3. Update task
4. Get task details
5. Delete task

### 3. File Upload Stress Test
1. Login
2. Create task
3. Upload file (test with different file sizes)

### 4. Concurrent User Simulation
- Multiple threads performing login and task operations simultaneously
- Observe API performance under load

## 🎯 Key JMeter Components for This App

### Pre-processor
- **HTTP Header Manager** - Add Authorization header
  - Name: `Authorization`
  - Value: `Bearer ${SESSION_TOKEN}`

### Extractor
- **JSON Extractor** - Extract token from login
  - Names: `SESSION_TOKEN`
  - JSON Path Expressions: `$.sessionToken`

### Post-processor
- **Regular Expression Extractor** - Extract task ID
- **JSON Extractor** - More reliable for JSON responses

### Assertion
- **Response Assertion** - Verify expected values
  - Check for specific text in response
  - Verify HTTP status codes

## 💾 Sample Request JSON

### Login
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

### Create Task
```json
{
  "title": "Test Task",
  "description": "Testing performance",
  "priority": "high",
  "status": "pending",
  "dueDate": "2024-12-31"
}
```

### Update Task
```json
{
  "status": "in-progress"
}
```

## 📊 Interpreting Results

- **Avg Response Time**: Average time for all requests
- **Min/Max**: Minimum and maximum response times
- **95%ile/99%ile**: Performance at higher percentiles (more realistic)
- **Throughput**: Requests per second
- **Error %**: Percentage of failed requests

### Good Performance Indicators
- Avg response time < 500ms
- 95%ile < 1000ms
- Error rate 0%
- Throughput remains stable

## ⚠️ Common Mistakes

1. ❌ Not extracting token after login
   - ✅ Use JSON Extractor to capture sessionToken

2. ❌ Forgetting Authorization header
   - ✅ Add HTTP Header Manager to all protected endpoints

3. ❌ Hardcoding IDs instead of extracting them
   - ✅ Use JSON Extractor to capture dynamic IDs

4. ❌ Running too many threads too quickly
   - ✅ Use appropriate ramp-up time

5. ❌ Not checking response assertions
   - ✅ Add assertions to verify responses

## 🔍 Debugging Tips

1. **View Results Tree** - See individual requests and responses
2. **Debug Sampler** - Print variables to understand state
3. **Response Assertion** - Add to catch unexpected responses
4. **Logs** - Check backend logs for errors

## 📈 Progressive Load Testing

Start small and increase:

| Phase | Threads | Ramp-up | Loop |
|-------|---------|---------|------|
| Baseline | 1 | 1s | 1 |
| Light Load | 5 | 10s | 5 |
| Normal Load | 10 | 20s | 10 |
| Stress Test | 50 | 30s | 20 |
| Spike Test | 100 | 5s | 5 |

---

For detailed examples and API endpoint information, see the main README.md
