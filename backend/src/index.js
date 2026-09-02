const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const utilityRoutes = require('./routes/utility');
const authMiddleware = require('./middleware/auth');

const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8'));

const app = express();
const PORT = process.env.PORT || 3000;

const FRONTEND_DIR = path.join(__dirname, '../../frontend/html');
const serveFrontend = fs.existsSync(FRONTEND_DIR);

app.use(cors({ origin: 'http://localhost' }));
app.use(morgan('dev'));
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Utility routes (no /api prefix for health, /api prefix for slow and reset)
app.use(utilityRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Task routes (JWT protected)
app.use('/api/tasks', authMiddleware, taskRoutes);

// Serve frontend when running natively (not in Docker — nginx handles it there)
if (serveFrontend) {
  app.use(express.static(FRONTEND_DIR));
  app.get('/', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));
  app.get('/register', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'register.html')));
  app.get('/tasks', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'tasks.html')));
  app.get('/tasks/new', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'tasks-new.html')));
  app.get('/tasks/:id/edit', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'tasks-edit.html')));
}

app.listen(PORT, () => {
  console.log(`Tasks API running on port ${PORT}`);
  if (serveFrontend) {
    console.log(`Frontend available at http://localhost:${PORT}`);
  }
});
