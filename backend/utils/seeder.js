require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Alice Admin',
      email: 'admin@taskmanager.com',
      password: 'Admin@123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'Bob Builder',
      email: 'bob@taskmanager.com',
      password: 'Member@123',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'Carol Dev',
      email: 'carol@taskmanager.com',
      password: 'Member@123',
      role: 'member',
    });

    console.log('👥 Created users');

    // Create projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design',
      owner: admin._id,
      members: [admin._id, member1._id, member2._id],
      color: '#6366f1',
    });

    const project2 = await Project.create({
      name: 'Mobile App MVP',
      description: 'Build the minimum viable product for iOS and Android',
      owner: admin._id,
      members: [admin._id, member1._id],
      color: '#10b981',
    });

    console.log('📁 Created projects');

    // Create tasks
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago (overdue)
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now

    await Task.create([
      {
        title: 'Design homepage mockup',
        description: 'Create Figma designs for the new homepage layout',
        status: 'done',
        priority: 'high',
        dueDate: pastDate,
        project: project1._id,
        assignedTo: member1._id,
        createdBy: admin._id,
        tags: ['design', 'figma'],
      },
      {
        title: 'Implement responsive navbar',
        description: 'Build the navigation bar with mobile support',
        status: 'in-progress',
        priority: 'high',
        dueDate: futureDate,
        project: project1._id,
        assignedTo: member1._id,
        createdBy: admin._id,
        tags: ['frontend', 'css'],
      },
      {
        title: 'SEO optimization',
        description: 'Add meta tags, structured data, and optimize page speed',
        status: 'todo',
        priority: 'medium',
        dueDate: futureDate,
        project: project1._id,
        assignedTo: member2._id,
        createdBy: admin._id,
        tags: ['seo'],
      },
      {
        title: 'Setup React Native project',
        description: 'Initialize the RN project with navigation and state management',
        status: 'done',
        priority: 'high',
        dueDate: pastDate,
        project: project2._id,
        assignedTo: member1._id,
        createdBy: admin._id,
        tags: ['react-native', 'setup'],
      },
      {
        title: 'Build user authentication screens',
        description: 'Login, signup, and forgot password screens',
        status: 'in-progress',
        priority: 'high',
        dueDate: futureDate,
        project: project2._id,
        assignedTo: member1._id,
        createdBy: admin._id,
        tags: ['auth', 'mobile'],
      },
      {
        title: 'API integration for product listing',
        description: 'Connect to backend API and display products',
        status: 'todo',
        priority: 'medium',
        dueDate: pastDate, // Overdue!
        project: project2._id,
        assignedTo: member1._id,
        createdBy: admin._id,
        tags: ['api', 'mobile'],
      },
    ]);

    console.log('✅ Created tasks');
    console.log('\n📊 Sample Login Credentials:');
    console.log('Admin: admin@taskmanager.com / Admin@123');
    console.log('Member: bob@taskmanager.com / Member@123');
    console.log('Member: carol@taskmanager.com / Member@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

seed();
