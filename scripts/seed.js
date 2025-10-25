const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Food = require('../models/Food');

require('dotenv').config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create admin
    const adminExists = await User.findOne({ email: 'admin@festeats.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const admin = new User({
        name: 'Updated Admin Name',
        email: 'admin@festeats.com',
        password: hashedPassword,
        department: 'Admin',
        class: 'Admin',
        phone: '9876543210',
        isAdmin: true
      });
      await admin.save();
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Create a sample student user
    const studentExists = await User.findOne({ email: 'student@festeats.com' });
    if (!studentExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('student123', salt);
      const student = new User({
        name: 'Sample Student',
        email: 'student@festeats.com',
        password: hashedPassword,
        department: 'CSE',
        class: '3rd Year',
        phone: '1234567890'
      });
      await student.save();
      console.log('Student user created');
    } else {
      console.log('Student user already exists');
    }

    console.log('Seeding complete');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
}

seed();
