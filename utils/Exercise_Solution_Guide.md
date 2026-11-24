# JMeter Performance Testing — Exercise Solution Guide

**Course:** Performance Testing with JMeter
**Audience:** Beginners with no prior JMeter experience
**App URL:** http://localhost
**Swagger UI:** http://localhost/api-docs

---

## Before You Start

### Is the app running?

Open your browser and go to http://localhost. You should see the login page.
If you see an error, start the app first:

**Docker:**
```bash
docker compose up --build
```

**Native:**
```bash
cd backend && npm start
```

### Seed users available

| Username | Password | Tasks |
|---|---|---|
| user1 | password1 | TASK-001 to TASK-005 |
| user2 | password2 | TASK-006 to TASK-010 |
| user3 | password3 | TASK-011 to TASK-015 |
| user4 | password4 | TASK-016 to TASK-020 |
| user5 | password5 | TASK-021 to TASK-025 |
| user6 | password6 | TASK-026 to TASK-030 |
| user7 | password7 | TASK-031 to TASK-035 |
| user8 | password8 | TASK-036 to TASK-040 |
| user9 | password9 | TASK-041 to TASK-045 |
| user10 | password10 | TASK-046 to TASK-050 |

### JMeter layout reminder

```
┌─────────────────────┬──────────────────────────────────┐
│  Test Plan Tree     │  Configuration Panel             │
│  (left panel)       │  (right panel)                   │
│                     │                                  │
│  > Test Plan        │  Set values here for whatever    │
│    > Thread Group   │  is selected on the left         │
│      > Sampler      │                                  │
│      > Listener     │                                  │
└─────────────────────┴──────────────────────────────────┘
                    [▶ Run]  [■ Stop]  — top toolbar
```

---

## Exercise 1 — Explore the App

**Time:** 20 minutes
**Goal:** Get familiar with the demo app before writing any tests.
**Script:** `JMeter Scripts/Exercise 1 - Explore the App/EX1_Explore_App.jmx`

---

### Part A — Explore in the Browser (10 minutes)

#### Step 1 — Open the app

1. Open your browser
2. Go to **http://localhost**
3. You should see the login page

> 📸 **Screenshot checkpoint:** Login page with username and password fields visible

#### Step 2 — Log in

1. Enter username: `user1`
2. Enter password: `password1`
3. Click **Login**
4. You should land on the Tasks page showing TASK-001 to TASK-005

> 📸 **Screenshot checkpoint:** Tasks list showing 5 tasks for user1

#### Step 3 — Try the app features

Work through each of these actions:

| Action | How | What to notice |
|---|---|---|
| View tasks | Already on tasks page | Tasks have an ID, description, due date, status |
| Search | Type `TASK-001` in the search box | Only one task returned |
| Search by status | Type `active` in the search box | Multiple tasks returned |
| Create a task | Click New Task, fill in the form | New task appears with a generated TASK-ID |
| Edit a task | Click a task, change the description | Task updates immediately |
| Delete a task | Click delete on any task | Task disappears from the list |

#### Step 4 — Open browser DevTools

1. Press **F12** (or right-click → Inspect)
2. Click the **Network** tab
3. Reload the page
4. Look at the requests being made

> 💡 **What to notice:** You will see calls to `/api/auth/csrf`, `/api/auth/login`, `/api/tasks` — these are exactly what JMeter will simulate

#### Step 5 — Explore Swagger UI

1. Go to **http://localhost/api-docs**
2. Find the `GET /health` endpoint
3. Click **Try it out** → **Execute**
4. You should see:
```json
{ "status": "ok" }
```
5. Find `GET /api/auth/csrf` and execute it
6. You should see:
```json
{ "csrfToken": "some-random-value" }
```

> 💡 **Key observation:** The csrfToken changes every time you call this endpoint. This is why we need **correlation** in JMeter — we cannot hardcode it.

---

### Part B — Open the Solution Script (10 minutes)

#### Step 1 — Open JMeter

1. Launch JMeter
2. You should see a blank Test Plan

#### Step 2 — Open the Exercise 1 script

1. Go to **File → Open**
2. Navigate to `JMeter Scripts/Exercise 1 - Explore the App/`
3. Select `EX1_Explore_App.jmx`
4. Click **Open**

> 📸 **Screenshot checkpoint:** JMeter with the test plan tree showing three requests

#### Step 3 — Explore the script structure

Click each element in the left panel and read the configuration on the right:

```
Test Plan
├── HTTP Request Defaults      ← server=localhost, port=80
└── Thread Group (1 user)
    ├── 01_Health_Check        ← GET /health
    │   └── Assert 200 OK
    ├── 02_Get_CSRF_Token      ← GET /api/auth/csrf
    │   └── Assert 200 OK
    ├── 03_Get_Tasks_No_Auth   ← GET /api/tasks (no token)
    │   └── Assert 401         ← intentionally expects failure
    └── View Results Tree
```

> 💡 **Why is there a 401 assertion?** This teaches an important concept — asserting that security works correctly is also a valid test. Without a token, the API should reject the request.

#### Step 4 — Run the script

1. Click the green **▶ Play** button in the toolbar
2. Click **View Results Tree** in the left panel
3. You should see three requests

> 📸 **Screenshot checkpoint:** View Results Tree showing all three requests

---

### Expected Outcomes — Exercise 1

| Request | Expected Response Code | Expected Response Body |
|---|---|---|
| 01_Health_Check | 200 | `{"status":"ok"}` |
| 02_Get_CSRF_Token | 200 | `{"csrfToken":"..."}` |
| 03_Get_Tasks_No_Auth | 401 | `{"error":"No token provided"}` |

**In View Results Tree:**
- Green icon = assertion passed
- Click any request → click **Response data** tab to see the full response body
- Click **Request** tab to see exactly what JMeter sent

---

### Troubleshooting — Exercise 1

| Problem | Likely cause | Fix |
|---|---|---|
| All requests show red | App not running | Go to http://localhost — if blank, run `docker compose up` |
| Port connection refused | Wrong port | Check HTTP Request Defaults — Docker uses port 80, native uses 3000 |
| 01_Health_Check is red | Assertion failed | Click the request → Assertion Results tab to see the failure message |
| 03_Get_Tasks_No_Auth shows green unexpectedly | App has no auth | Check the app is the correct version |

---

## Exercise 2 — Your First JMeter Test

**Time:** 30 minutes
**Goal:** Build a JMeter test from scratch without any help.
**Script (reference):** `JMeter Scripts/Exercise 2 - First JMeter Test/EX2_First_JMeter_Test.jmx`

---

### What You Will Build

```
Test Plan
└── Thread Group (1 user, 1 loop)
    ├── HTTP Request Defaults
    ├── GET /health
    │   └── Assert 200 OK
    ├── View Results Tree
    └── Summary Report
```

---

### Step-by-Step Instructions

#### Step 1 — Create a new Test Plan

1. Open JMeter
2. Go to **File → New** (or close any open plan)
3. Click on **Test Plan** in the left panel
4. In the right panel, change the name to: `Exercise 2 - First JMeter Test`

> 📸 **Screenshot checkpoint:** Empty test plan with the new name

#### Step 2 — Add a Thread Group

A Thread Group represents your virtual users.

1. Right-click **Test Plan** in the left panel
2. Select **Add → Threads (Users) → Thread Group**
3. A Thread Group appears under Test Plan
4. In the right panel, set:

| Field | Value | What it means |
|---|---|---|
| Name | `Thread Group` | Label shown in the tree |
| Number of Threads | `1` | 1 virtual user |
| Ramp-up Period | `1` | Start all users over 1 second |
| Loop Count | `1` | Each user runs the journey once |

> 📸 **Screenshot checkpoint:** Thread Group panel with values filled in

#### Step 3 — Add HTTP Request Defaults

This sets the server details once so you don't repeat them on every request.

1. Right-click **Thread Group**
2. Select **Add → Config Element → HTTP Request Defaults**
3. In the right panel, set:

| Field | Value |
|---|---|
| Server Name or IP | `localhost` |
| Port Number | `80` |
| Protocol | `http` |

> 💡 **Tip:** If you are running the app natively (not Docker), use port `3000` instead of `80`

> 📸 **Screenshot checkpoint:** HTTP Request Defaults with localhost and port 80

#### Step 4 — Add an HTTP Request

1. Right-click **Thread Group**
2. Select **Add → Sampler → HTTP Request**
3. In the right panel, set:

| Field | Value |
|---|---|
| Name | `GET /health` |
| Method | `GET` |
| Path | `/health` |

> 💡 **Notice:** You do not need to set the server or port here — they come from HTTP Request Defaults

> 📸 **Screenshot checkpoint:** HTTP Request panel showing GET /health

#### Step 5 — Add a Response Assertion

An assertion checks that the response is what you expected.

1. Right-click **GET /health** (the request you just added)
2. Select **Add → Assertions → Response Assertion**
3. In the right panel:
   - **Field to Test:** select `Response Code`
   - Click **Add** button
   - Type `200` in the box that appears
   - **Pattern Matching Rules:** select `Equals`

> 📸 **Screenshot checkpoint:** Response Assertion with 200 in the patterns list

#### Step 6 — Add View Results Tree

1. Right-click **Thread Group**
2. Select **Add → Listener → View Results Tree**
3. Leave all settings as default

#### Step 7 — Add Summary Report

1. Right-click **Thread Group**
2. Select **Add → Listener → Summary Report**
3. Leave all settings as default

#### Step 8 — Save the test plan

1. Go to **File → Save**
2. Save as `EX2_My_First_Test.jmx` in a location you can find

#### Step 9 — Run the test

1. Click the green **▶ Play** button
2. JMeter will ask if you want to save — click **Save**
3. Click **View Results Tree** in the left panel
4. You should see one green request

> 📸 **Screenshot checkpoint:** View Results Tree showing GET /health in green

#### Step 10 — Explore the results

Click on the **GET /health** row in View Results Tree, then explore each tab:

| Tab | What you see |
|---|---|
| Sampler result | Response code, response time, bytes |
| Request | The exact HTTP request JMeter sent |
| Response data | The response body: `{"status":"ok"}` |
| Assertion results | Whether the 200 assertion passed |

---

### Bonus Challenges

If you finish early, try these:

**Challenge 1 — More users**
- Change Thread Group to 5 users, ramp-up 5 seconds
- Run again — do all 5 pass?

**Challenge 2 — Add another request**
- Add a second HTTP Request: `GET /api/auth/csrf`
- Run — can you see the csrfToken in the response body?

**Challenge 3 — Add Aggregate Report**
- Add **Listeners → Aggregate Report**
- Run with 5 users — what do the avg, min, max columns show?

---

### Expected Outcomes — Exercise 2

| What | Expected |
|---|---|
| GET /health response code | 200 |
| GET /health response body | `{"status":"ok"}` |
| Assertion result | Passed |
| Response time | Under 100ms |
| View Results Tree icon colour | Green |

---

### Troubleshooting — Exercise 2

| Problem | Likely cause | Fix |
|---|---|---|
| Red request, response code 0 | Cannot connect to server | Check app is running at http://localhost |
| Red request, response code 404 | Wrong path | Check path is `/health` not `/Health` or `health` |
| Assertion failed but got 200 | Assertion misconfigured | Check Field to Test = Response Code and pattern = 200 |
| Nothing appears in View Results Tree | Listener not under Thread Group | Make sure View Results Tree is inside the Thread Group |
| JMeter freezes | Too many threads | Stop with ■ button, reduce thread count |

---

### Comparing Your Script to the Solution

Open the reference script to compare:

1. **File → Open** → `Exercise 2 - First JMeter Test/EX2_First_JMeter_Test.jmx`
2. Compare your structure to the solution
3. Common differences beginners find:
   - Missing HTTP Request Defaults (server set on every request instead)
   - Assertion added to Thread Group instead of the request
   - View Results Tree added outside the Thread Group


---

## Exercise 3 — Complete API Workflow

**Time:** 60 minutes
**Goal:** Build a full user journey with correlation, parameterization, assertions and think times.
**Script (reference):** `JMeter Scripts/Exercise 3 - Complete API Workflow/API_DemoApp.jmx`
**CSV files:** `API_users.csv`, `API_search_queries.csv`

---

### What You Will Build

```
Test Plan
├── CSV Data Set Config — API_users.csv
├── CSV Data Set Config — API_search_queries.csv
├── HTTP Request Defaults
├── HTTP Header Manager
├── HTTP Cookie Manager
└── Thread Group (5 users, 15s ramp-up, 3 loops)
    ├── TC01_LOGIN
    │   ├── 01_Get_CSRF_Token  → Extract csrfToken
    │   └── 02_Login           → Extract authToken
    ├── Think Time (1-3s)
    ├── TC02_SEARCH
    │   └── 01_Search_Tasks
    ├── Think Time (1-3s)
    ├── TC03_ADD_TASK
    │   └── 01_Create_Task     → Extract NEW_TASK_ID
    ├── Think Time (1-3s)
    ├── TC04_UPDATE_TASK
    │   └── 01_Update_Task
    ├── Think Time (1-3s)
    ├── TC05_DELETE_TASK
    │   └── 01_Delete_Task
    ├── TC06_LOGOUT
    │   └── Clear Session
    ├── View Results Tree
    ├── Aggregate Report
    └── Summary Report
```

---

### Understanding the Login Flow

Before building, understand why correlation is needed:

```
Step 1:  GET /api/auth/csrf
         Response: {"csrfToken": "abc123xyz"}
                         ↓
                   JSON Extractor saves this as ${CSRF_TOKEN}

Step 2:  POST /api/auth/login
         Body: {"username":"user1","password":"password1","csrfToken":"abc123xyz"}
         Response: {"token": "eyJhbGci..."}
                         ↓
                   JSON Extractor saves this as ${AUTH_TOKEN}

Step 3+: Every request needs header:
         Authorization: Bearer eyJhbGci...
```

> 💡 **Why can't we hardcode the token?** The csrfToken changes on every request and the auth token expires. JMeter must capture them live and reuse them — this is called **correlation**.

---

### Step-by-Step Instructions

#### Step 1 — Create a new Test Plan

1. **File → New**
2. Name it: `Exercise 3 - Complete API Workflow`

#### Step 2 — Add CSV Data Set Config for users

1. Right-click **Test Plan → Add → Config Element → CSV Data Set Config**
2. Configure:

| Field | Value |
|---|---|
| Name | `User Credentials CSV` |
| Filename | `API_users.csv` |
| Variable Names | `USERNAME,PASSWORD` |
| Ignore First Line | `True` |
| Delimiter | `,` |
| Recycle on EOF | `True` |
| Share Mode | `All threads` |

> 💡 **Filename tip:** If the CSV is in the same folder as the JMX, just use the filename. Otherwise use the full path.

> 📸 **Screenshot checkpoint:** CSV Data Set Config with API_users.csv configured

#### Step 3 — Add CSV Data Set Config for search queries

1. Right-click **Test Plan → Add → Config Element → CSV Data Set Config**
2. Configure:

| Field | Value |
|---|---|
| Name | `Search Queries CSV` |
| Filename | `API_search_queries.csv` |
| Variable Names | `SEARCH_QUERY` |
| Ignore First Line | `True` |
| Recycle on EOF | `True` |

#### Step 4 — Add HTTP Request Defaults

1. Right-click **Test Plan → Add → Config Element → HTTP Request Defaults**
2. Set: Server = `localhost`, Port = `80`, Protocol = `http`

#### Step 5 — Add HTTP Header Manager

1. Right-click **Test Plan → Add → Config Element → HTTP Header Manager**
2. Click **Add** and set:
   - Name: `Content-Type`
   - Value: `application/json`

#### Step 6 — Add HTTP Cookie Manager

1. Right-click **Test Plan → Add → Config Element → HTTP Cookie Manager**
2. Tick **Clear cookies each iteration**
3. Leave everything else as default

#### Step 7 — Add Thread Group

1. Right-click **Test Plan → Add → Threads → Thread Group**
2. Configure:

| Field | Value |
|---|---|
| Number of Threads | `5` |
| Ramp-up Period | `15` |
| Loop Count | `3` |

#### Step 8 — Add TC01_LOGIN Transaction Controller

Transaction Controllers group related requests together and show combined timing.

1. Right-click **Thread Group → Add → Logic Controller → Transaction Controller**
2. Name it: `TC01_LOGIN`
3. Tick **Generate parent sample**

#### Step 9 — Add 01_Get_CSRF_Token inside TC01_LOGIN

1. Right-click **TC01_LOGIN → Add → Sampler → HTTP Request**
2. Configure:

| Field | Value |
|---|---|
| Name | `01_Get_CSRF_Token` |
| Method | `GET` |
| Path | `/api/auth/csrf` |

**Add JSON Extractor** (right-click 01_Get_CSRF_Token → Add → Post Processors → JSON Extractor):

| Field | Value |
|---|---|
| Name | `Extract CSRF Token` |
| Variable Names | `CSRF_TOKEN` |
| JSON Path Expressions | `$.csrfToken` |
| Default Value | `NOT_FOUND` |

**Add Response Assertion** (right-click 01_Get_CSRF_Token → Add → Assertions → Response Assertion):
- Field to Test: `Response Code`
- Pattern: `200`

> 📸 **Screenshot checkpoint:** 01_Get_CSRF_Token with JSON Extractor and Assertion underneath it

#### Step 10 — Add 02_Login inside TC01_LOGIN

1. Right-click **TC01_LOGIN → Add → Sampler → HTTP Request**
2. Configure:

| Field | Value |
|---|---|
| Name | `02_Login` |
| Method | `POST` |
| Path | `/api/auth/login` |
| Body Data | `{"username":"${USERNAME}","password":"${PASSWORD}","csrfToken":"${CSRF_TOKEN}"}` |

> 💡 **Body Data tab:** Click the **Body Data** tab (not Parameters) and paste the JSON. Make sure the variables use `${}` syntax exactly as shown.

**Add JSON Extractor** under 02_Login:

| Field | Value |
|---|---|
| Variable Names | `AUTH_TOKEN` |
| JSON Path Expressions | `$.token` |
| Default Value | `NOT_FOUND` |

**Add Response Assertion** under 02_Login:
- Response Code = `200`

> 📸 **Screenshot checkpoint:** TC01_LOGIN expanded showing both requests with their extractors

#### Step 11 — Add Think Time after TC01_LOGIN

1. Right-click **Thread Group → Add → Timer → Uniform Random Timer**
2. Set:
   - Constant Delay Offset: `1000` (ms)
   - Random Delay Maximum: `2000` (ms)
3. Name it: `Think Time`

> 💡 **What this does:** JMeter waits between 1 and 3 seconds before the next transaction — simulating a real user pausing to read the page.

#### Step 12 — Add TC02_SEARCH

1. Right-click **Thread Group → Add → Logic Controller → Transaction Controller**
2. Name: `TC02_SEARCH`, tick **Generate parent sample**
3. Add HTTP Request inside it:

| Field | Value |
|---|---|
| Name | `01_Search_Tasks` |
| Method | `GET` |
| Path | `/api/tasks/search` |
| Parameters | Name: `q`, Value: `${SEARCH_QUERY}` |

**Add HTTP Header Manager** under 01_Search_Tasks:
- Name: `Authorization`, Value: `Bearer ${AUTH_TOKEN}`

**Add Response Assertion:** Response Code = `200`

Add another **Think Time** after TC02_SEARCH.

#### Step 13 — Add TC03_ADD_TASK

1. Add Transaction Controller: `TC03_ADD_TASK`
2. Add HTTP Request inside:

| Field | Value |
|---|---|
| Name | `01_Create_Task` |
| Method | `POST` |
| Path | `/api/tasks` |
| Body Data | `{"description":"Load test task ${__threadNum}","due_date":"2026-12-31","status":"active"}` |

**Add HTTP Header Manager:** `Authorization: Bearer ${AUTH_TOKEN}`

**Add JSON Extractor:**

| Field | Value |
|---|---|
| Variable Names | `NEW_TASK_ID` |
| JSON Path Expressions | `$.task_id` |
| Default Value | `NOT_FOUND` |

**Add Response Assertion:** Response Code = `201`

Add **Think Time** after TC03_ADD_TASK.

#### Step 14 — Add TC04_UPDATE_TASK

1. Add Transaction Controller: `TC04_UPDATE_TASK`
2. Add HTTP Request:

| Field | Value |
|---|---|
| Name | `01_Update_Task` |
| Method | `PUT` |
| Path | `/api/tasks/${NEW_TASK_ID}` |
| Body Data | `{"description":"Updated by thread ${__threadNum}","due_date":"2026-12-31","status":"completed"}` |

**Add HTTP Header Manager:** `Authorization: Bearer ${AUTH_TOKEN}`
**Add Response Assertion:** Response Code = `200`

Add **Think Time** after TC04_UPDATE_TASK.

#### Step 15 — Add TC05_DELETE_TASK

1. Add Transaction Controller: `TC05_DELETE_TASK`
2. Add HTTP Request:

| Field | Value |
|---|---|
| Name | `01_Delete_Task` |
| Method | `DELETE` |
| Path | `/api/tasks/${NEW_TASK_ID}` |

**Add HTTP Header Manager:** `Authorization: Bearer ${AUTH_TOKEN}`
**Add Response Assertion:** Response Code = `200`

Add **Think Time** after TC05_DELETE_TASK.

#### Step 16 — Add TC06_LOGOUT

1. Add Transaction Controller: `TC06_LOGOUT`
2. Right-click TC06_LOGOUT → **Add → Sampler → JSR223 Sampler**
3. Name: `Clear Session`
4. Language: `Groovy`
5. Script:
```groovy
vars.put("AUTH_TOKEN", "")
vars.put("CSRF_TOKEN", "")
log.info("User logged out - session cleared")
```

#### Step 17 — Add Listeners

Right-click **Thread Group** and add:
- **Add → Listener → View Results Tree**
- **Add → Listener → Aggregate Report**
- **Add → Listener → Summary Report**

#### Step 18 — Save and Run

1. **File → Save**
2. Click **▶ Play**
3. Watch View Results Tree — requests should appear green

> 📸 **Screenshot checkpoint:** View Results Tree showing all transactions in green

---

### Expected Outcomes — Exercise 3

| Transaction | Expected Code | Key check |
|---|---|---|
| 01_Get_CSRF_Token | 200 | CSRF_TOKEN variable is not NOT_FOUND |
| 02_Login | 200 | AUTH_TOKEN variable is not NOT_FOUND |
| 01_Search_Tasks | 200 | Results array returned |
| 01_Create_Task | 201 | NEW_TASK_ID variable is not NOT_FOUND |
| 01_Update_Task | 200 | Task updated |
| 01_Delete_Task | 200 | Task deleted |

**In Aggregate Report you should see:**
- All transactions listed by name
- Average response time under 500ms
- Error % = 0.00%

---

### How to Verify Correlation is Working

1. Click **View Results Tree**
2. Click **02_Login**
3. Click **Response data** tab
4. You should see a token in the response:
```json
{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```
5. Now click **01_Create_Task**
6. Click **Request** tab
7. You should see the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

If the token in the login response matches the token in the create request header — **correlation is working**.

---

### Troubleshooting — Exercise 3

| Problem | Likely cause | Fix |
|---|---|---|
| 02_Login returns 403 | CSRF_TOKEN is NOT_FOUND | Check JSON Extractor path is `$.csrfToken` (lowercase c) |
| 02_Login returns 401 | Wrong username/password | Check CSV file has correct credentials and CSV is loaded |
| 01_Create_Task returns 401 | AUTH_TOKEN is NOT_FOUND | Check JSON Extractor on login uses `$.token` |
| 01_Update_Task returns 404 | NEW_TASK_ID is NOT_FOUND | Check JSON Extractor on create uses `$.task_id` |
| All requests after login fail | Auth header missing | Check each request has HTTP Header Manager with `Bearer ${AUTH_TOKEN}` |
| CSV not loading | Wrong filename or path | Put CSV in same folder as JMX, use filename only (no path) |
| Error rate > 0% after many loops | Database filling up | Call `POST /api/reset-and-reseed` to reset data |


---

## Exercise 4 — Workload Mix

**Time:** 40 minutes
**Goal:** Run two different user types simultaneously in one test plan.
**Script (reference):** `JMeter Scripts/Exercise 4 - Workload Mix/EX4_Workload_Mix.jmx`
**CSV files:** `EX4_readonly_users.csv`, `EX4_taskmanager_users.csv`, `EX4_search_queries.csv`

---

### The Concept

Real production traffic is never just one type of user. A workload mix models this reality:

```
Thread Group 1 — Read-Only Users (6 threads)
  These users only browse and search. They never write data.
  Journey: Login → Browse Tasks → Search → View Task → Logout

Thread Group 2 — Task Managers (4 threads)
  These users create, update and delete tasks.
  Journey: Login → Create Task → Update Task → Delete Task → Logout

Both groups run at the same time in the same test plan.
Total: 10 virtual users, two different behaviours.
```

> 💡 **Why does this matter?** Write operations (create/update/delete) put more load on the database than reads. Running both together shows you how write-heavy traffic affects read performance — something a single thread group test would never reveal.

---

### CSV File Split

| CSV File | Used by | Users |
|---|---|---|
| EX4_readonly_users.csv | Thread Group 1 | user1 – user6 |
| EX4_taskmanager_users.csv | Thread Group 2 | user7 – user10 |
| EX4_search_queries.csv | Thread Group 1 | TASK-001, active, completed etc. |

> 💡 **Why separate CSV files?** Both thread groups need different usernames. If they shared one CSV, they would compete for the same rows and potentially log in as the wrong user type.

---

### Step-by-Step Instructions

#### Step 1 — Open the reference script

1. **File → Open**
2. Navigate to `Exercise 4 - Workload Mix/`
3. Open `EX4_Workload_Mix.jmx`

#### Step 2 — Explore the structure

Expand the full tree and note the key differences from Exercise 3:

```
Test Plan
├── Read-Only Users CSV      ← USERNAME, PASSWORD (user1-user6)
├── Task Manager Users CSV   ← TM_USERNAME, TM_PASSWORD (user7-user10)
├── Search Queries CSV       ← SEARCH_QUERY
├── HTTP Request Defaults
├── HTTP Header Manager
├── HTTP Cookie Manager
│
├── TG1 - Read-Only Users    ← 6 threads, 15s ramp, 3 loops
│   ├── TC01_LOGIN
│   ├── TC02_BROWSE_TASKS
│   ├── TC03_SEARCH
│   ├── TC04_VIEW_TASK
│   ├── TC05_LOGOUT
│   └── Listeners
│
└── TG2 - Task Managers      ← 4 threads, 15s ramp, 3 loops
    ├── TC01_LOGIN            ← uses ${TM_USERNAME} and ${TM_PASSWORD}
    ├── TC02_CREATE_TASK      ← extracts newTaskId
    ├── TC03_UPDATE_TASK      ← uses ${newTaskId}
    ├── TC04_DELETE_TASK      ← uses ${newTaskId}
    ├── TC05_LOGOUT
    └── Listeners
```

> 📸 **Screenshot checkpoint:** Full test plan tree showing both thread groups expanded

#### Step 3 — Note the variable name difference

Click **02_Login** inside **TG1** and look at the Body Data:
```json
{"username":"${USERNAME}","password":"${PASSWORD}","csrfToken":"${csrfToken}"}
```

Click **02_Login** inside **TG2** and look at the Body Data:
```json
{"username":"${TM_USERNAME}","password":"${TM_PASSWORD}","csrfToken":"${csrfToken}"}
```

> 💡 **Why different variable names?** Both thread groups run at the same time. If both used `${USERNAME}`, they would overwrite each other's values. Separate variable names keep them isolated.

#### Step 4 — Check the CSV Share Mode

Click **Read-Only Users CSV** in the tree. Note:
- Share Mode = `shareMode.group`

This means only Thread Group 1 reads from this CSV. Thread Group 2 cannot access it.

Click **Task Manager Users CSV**:
- Share Mode = `shareMode.group`

Same — only Thread Group 2 reads from this one.

#### Step 5 — Run the test

1. Click **▶ Play**
2. Open **View Results Tree** under TG1
3. Open **View Results Tree** under TG2
4. Watch both running simultaneously

> 📸 **Screenshot checkpoint:** Both View Results Trees showing requests from different thread groups

#### Step 6 — Compare the Aggregate Reports

Open **Aggregate Report** under TG1 and TG2 side by side:

**Questions to answer:**
- Which transactions are slowest in TG1?
- Which transactions are slowest in TG2?
- Are the read operations in TG1 slower because TG2 is writing at the same time?

---

### Bonus Challenge — Increase Write Load

1. Change TG2 threads from 4 to 8
2. Keep TG1 at 6 threads
3. Run again
4. Compare the Aggregate Report for TG1 — did read times increase?

> 💡 **What you are testing:** Whether write-heavy load degrades read performance. This is a common real-world bottleneck caused by database locking.

---

### Expected Outcomes — Exercise 4

| Thread Group | Transaction | Expected Code | Notes |
|---|---|---|---|
| TG1 | 01_Get_CSRF_Token | 200 | |
| TG1 | 02_Login | 200 | Uses user1–user6 |
| TG1 | 01_Get_Tasks_List | 200 | Returns paginated tasks |
| TG1 | 01_Search_Tasks | 200 | Uses SEARCH_QUERY from CSV |
| TG1 | 01_View_Task | 200 | Always fetches TASK-001 |
| TG2 | 01_Get_CSRF_Token | 200 | |
| TG2 | 02_Login | 200 | Uses user7–user10 |
| TG2 | 01_Create_Task | 201 | newTaskId extracted |
| TG2 | 01_Update_Task | 200 | Uses newTaskId |
| TG2 | 01_Delete_Task | 200 | Uses newTaskId |

---

### Troubleshooting — Exercise 4

| Problem | Likely cause | Fix |
|---|---|---|
| TG2 login fails with 401 | TM_USERNAME/TM_PASSWORD not found | Check CSV variable names match exactly |
| TG2 create returns 401 | authToken from TG1 being used | Check TG2 login extracts its own authToken |
| Both groups use same users | Share mode wrong | Set CSV share mode to `shareMode.group` |
| newTaskId is NOT_FOUND | Create task failed | Check TG2 login is succeeding first |
| One group finishes before the other | Different loop counts | Both groups should have same loop count |

---

## AI Prompts for JMeter

The four AI prompts are available as individual text files in `deck/prompts/`. Open the relevant file, copy the contents, and paste into any AI assistant (Amazon Q, ChatGPT, etc.).

| Prompt | File | Use when |
|--------|------|----------|
| 1 — Unknown App | `AI_Prompt_1_Unknown_App.txt` | You have no knowledge of the app |
| 2 — Swagger Spec | `AI_Prompt_2_Swagger_Spec.txt` | You have API documentation |
| 3 — Demo App | `AI_Prompt_3_Demo_App.txt` | Using the Task Management training app |
| 4 — Analyse Results | `AI_Prompt_4_Analyse_Results.txt` | After running a test, to generate an HTML report |

---

## Quick Reference Card

### JMeter Right-Click Menu Cheat Sheet

| What you want to add | Right-click on | Menu path |
|---|---|---|
| Thread Group | Test Plan | Add → Threads → Thread Group |
| HTTP Request | Thread Group or Transaction Controller | Add → Sampler → HTTP Request |
| HTTP Request Defaults | Test Plan or Thread Group | Add → Config Element → HTTP Request Defaults |
| CSV Data Set Config | Test Plan | Add → Config Element → CSV Data Set Config |
| HTTP Header Manager | Test Plan, Thread Group or Request | Add → Config Element → HTTP Header Manager |
| HTTP Cookie Manager | Test Plan or Thread Group | Add → Config Element → HTTP Cookie Manager |
| JSON Extractor | HTTP Request (the specific one) | Add → Post Processors → JSON Extractor |
| Response Assertion | HTTP Request (the specific one) | Add → Assertions → Response Assertion |
| Transaction Controller | Thread Group | Add → Logic Controller → Transaction Controller |
| Think Time (Timer) | Thread Group | Add → Timer → Uniform Random Timer |
| View Results Tree | Thread Group | Add → Listener → View Results Tree |
| Aggregate Report | Thread Group | Add → Listener → Aggregate Report |
| Summary Report | Thread Group | Add → Listener → Summary Report |

### Variable Reference

| Variable | Set by | Used in |
|---|---|---|
| `${USERNAME}` | CSV Data Set Config | Login request body |
| `${PASSWORD}` | CSV Data Set Config | Login request body |
| `${SEARCH_QUERY}` | CSV Data Set Config | Search request parameter |
| `${CSRF_TOKEN}` | JSON Extractor on CSRF request | Login request body |
| `${AUTH_TOKEN}` | JSON Extractor on Login request | Authorization header |
| `${NEW_TASK_ID}` | JSON Extractor on Create request | Update and Delete paths |
| `${__threadNum}` | Built-in JMeter function | Any field — gives thread number |

### HTTP Status Codes

| Code | Meaning | When you see it |
|---|---|---|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (task created) |
| 400 | Bad Request | Missing or invalid request body |
| 401 | Unauthorised | Missing or expired auth token |
| 403 | Forbidden | Invalid CSRF token |
| 404 | Not Found | Wrong URL or task ID does not exist |
| 429 | Too Many Requests | Rate limit hit under heavy load |
| 500 | Internal Server Error | App crashed or database error |
| 503 | Service Unavailable | App overwhelmed under stress |

---

*Exercise Solution Guide — Performance Testing with JMeter — Kainos Academy*

---

# APPENDIX: COMPREHENSIVE TROUBLESHOOTING GUIDE

---

## Common Issues and Solutions

### Connection Problems

| Symptom | Cause | Solution |
|---------|-------|----------|
| Response code: 0 | Cannot connect to server | Check app is running at http://localhost |
| Connection refused | Wrong port or app not started | Verify port in HTTP Request Defaults |
| Connection timed out | Server overloaded | Reduce thread count, check server resources |

### Authentication Problems

| Symptom | Cause | Solution |
|---------|-------|----------|
| 401 on login | Wrong credentials | Check CSV file has correct username/password |
| 401 after login | Token not extracted | Add Debug Sampler, check AUTH_TOKEN value |
| 403 Forbidden | CSRF token invalid | Check CSRF_TOKEN extractor |
| Token shows as literal text | Variable not resolved | Check extractor is UNDER the request |

### Extractor Problems

| Symptom | Cause | Solution |
|---------|-------|----------|
| Variable = NOT_FOUND | JSON path wrong | Check response body, verify path |
| Variable = null | Field exists but empty | Check API response |
| Extractor not running | Wrong placement | Extractor must be child of request |

### CSV Problems

| Symptom | Cause | Solution |
|---------|-------|----------|
| Variable shows as literal | CSV not loaded | Check filename, put CSV in same folder as JMX |
| Wrong user data | Header row read as data | Set Ignore first line = True |
| Same user every time | Sharing mode wrong | Use All threads or Current thread group |

---

## Debug Checklist

When something goes wrong, follow this checklist:

### Step 1: Add Debug Sampler
1. Right-click Thread Group then Add then Sampler then Debug Sampler
2. Place it AFTER the request you want to debug
3. Run the test
4. Click Debug Sampler in View Results Tree
5. Check Response Data tab for all variable values

### Step 2: Check Request Details
1. Click the failing request in View Results Tree
2. Click Request tab
3. Verify URL, Method, Headers, and Body

### Step 3: Check Response Details
1. Click Response data tab
2. Look for error messages in JSON or HTML error pages

### Step 4: Check Assertion Results
1. Click Assertion Results tab
2. Read the failure message

---

## Quick Fixes by Error Code

### 400 Bad Request
- Check Content-Type header is application/json
- Check request body is valid JSON
- Check required fields are present

### 401 Unauthorized
- Check Authorization header is present
- Check format is Bearer followed by space and token
- Check token was extracted successfully

### 403 Forbidden
- Check CSRF token included in login request
- Check CSRF token was extracted from /api/auth/csrf

### 404 Not Found
- Check URL path is correct
- Check path starts with /
- Check dynamic ID in path was extracted

### 500 Internal Server Error
- Check application logs
- Verify database is running
- Try the same request in Swagger UI

---

## Verification Commands

Check if App is Running:
curl http://localhost/health

Reset Database:
curl -X POST http://localhost/api/reset-and-reseed

---

## Exercise-Specific Tips

### Exercise 1
- JMX file is in: JMeter Scripts/Exercise 1 - Explore the App/
- If app shows blank page, run docker compose up

### Exercise 2
- Start by right-clicking Test Plan then Add then Threads then Thread Group
- HTTP Request Defaults is under Add then Config Element

### Exercise 3
- If login works but search fails, check Authorization header
- If create works but update fails, check NEW_TASK_ID extraction
- Add Debug Sampler to verify variable values

### Exercise 4
- Use different variable names for each thread group
- Set CSV Share Mode to shareMode.group
- Add separate Aggregate Report to each Thread Group

---

End of Troubleshooting Guide
