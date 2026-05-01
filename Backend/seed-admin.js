require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existing = await Admin.findOne({ email: 'admin@appzeto.com' });
    if (existing) {
      console.log('⚠️ Admin already exists:', existing.email);
      process.exit(0);
    }

    // Create super admin
    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@appzeto.com',
      password: 'admin123',
      role: 'super_admin',
      isActive: true
    });

    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123');
    console.log('👑 Role:', admin.role);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAdmin();
