const bcrypt = require('bcryptjs');
const db = require('./database');

async function seedDatabase() {
  try {
    await db.initialize();
    
    // Create demo users
    const users = [];
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('password456', 10);
    
    const user1 = await db.createUser({
      email: 'alice@example.com',
      password: hashedPassword1,
      name: 'Alice Johnson',
      role: 'user'
    });
    users.push(user1);
    console.log('✓ Created user 1: alice@example.com');
    
    const user2 = await db.createUser({
      email: 'bob@example.com',
      password: hashedPassword2,
      name: 'Bob Smith',
      role: 'user'
    });
    users.push(user2);
    console.log('✓ Created user 2: bob@example.com');
    
    // Create demo tasks for user 1
    const taskTitles = [
      'Complete JMeter training',
      'Write performance test plan',
      'Analyze API response times',
      'Setup load testing environment',
      'Document test scenarios',
      'Review performance results',
      'Optimize database queries',
      'Create JMeter scripts'
    ];
    
    const taskDescriptions = [
      'Complete the online JMeter course and practice with real-world scenarios',
      'Create a comprehensive test plan for our API endpoints',
      'Analyze and document API response times under various loads',
      'Set up the complete load testing environment with JMeter',
      'Document all test scenarios for different user journeys',
      'Review the performance testing results and create reports',
      'Identify and optimize slow database queries',
      'Create reusable JMeter scripts for common testing scenarios'
    ];
    
    for (let i = 0; i < 8; i++) {
      const priority = ['high', 'medium', 'low'][Math.floor(Math.random() * 3)];
      const status = ['pending', 'in-progress', 'completed'][Math.floor(Math.random() * 3)];
      
      await db.createTask({
        userId: user1.id,
        title: taskTitles[i],
        description: taskDescriptions[i],
        priority,
        status,
        dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    console.log('✓ Created 8 tasks for Alice');
    
    // Create demo tasks for user 2
    const user2TaskTitles = [
      'Review performance metrics',
      'Create monitoring dashboard',
      'Setup alerts for slow endpoints',
      'Performance improvement sprint'
    ];
    
    const user2TaskDescriptions = [
      'Review and analyze performance metrics from last week',
      'Create a dashboard to monitor API performance',
      'Setup automated alerts for slow-performing endpoints',
      'Plan and execute performance improvement sprint'
    ];
    
    for (let i = 0; i < 4; i++) {
      const priority = i === 0 ? 'high' : 'medium';
      await db.createTask({
        userId: user2.id,
        title: user2TaskTitles[i],
        description: user2TaskDescriptions[i],
        priority,
        status: 'pending',
        dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    console.log('✓ Created 4 tasks for Bob');
    
    console.log('\n📊 Database seeding complete!');
    console.log('\nDemo Credentials:');
    console.log('  User 1: alice@example.com / password123');
    console.log('  User 2: bob@example.com / password456');
    
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('\nRun "npm start" to start the server');
    process.exit(0);
  });
}

module.exports = seedDatabase;
