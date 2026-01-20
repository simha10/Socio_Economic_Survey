const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Socio-Economic-Survey');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create default users
    const users = [
      {
        username: 'admin',
        name: 'System Administrator',
        password: 'admin123',
        role: 'ADMIN'
      },
      {
        username: 'supervisor',
        name: 'Survey Supervisor',
        password: 'supervisor123',
        role: 'SUPERVISOR'
      },
      {
        username: 'surveyor',
        name: 'Field Surveyor',
        password: 'surveyor123',
        role: 'SURVEYOR'
      }
    ];

    // Insert users one by one to ensure password hashing
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`- ${user.name} (${user.username}) - ${user.role}`);
    }
    console.log('Created users:');

    console.log('\nSeed completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Supervisor: username=supervisor, password=supervisor123');
    console.log('Surveyor: username=surveyor, password=surveyor123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers();