const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createAdminUser() {
  const mongoUri = process.env.DATABASE_URL;
  
  if (!mongoUri) {
    console.error('ERROR: DATABASE_URL not set in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db('fleetxchange');
    const usersCollection = db.collection('users');

    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ 
      email: 'admin@fleet.test' 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password', 10);

    // Create admin user
    const adminUser = {
      email: 'admin@fleet.test',
      password: hashedPassword,
      role: 'ADMIN',
      companyName: 'Fleet Admin',
      contactName: 'Administrator',
      phone: '+27000000000',
      isVerified: true,
      verificationStatus: 'APPROVED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(adminUser);

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@fleet.test');
    console.log('🔑 Password: password');
    console.log('👤 Role:     ADMIN');
    console.log('🆔 User ID:  ' + result.insertedId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

createAdminUser();
