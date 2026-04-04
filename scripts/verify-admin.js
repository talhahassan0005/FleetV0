const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function verifyAdmin() {
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

    // Check if admin exists
    const admin = await usersCollection.findOne({ 
      email: 'admin@fleet.test' 
    });

    if (!admin) {
      console.log('❌ Admin user does not exist!');
      console.log('\n📝 Creating admin user...');
      
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
      console.log('🆔 User ID: ' + result.insertedId);
    } else {
      console.log('✅ Admin user exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:        ' + admin.email);
      console.log('👤 Role:         ' + admin.role);
      console.log('✔️  Verified:     ' + admin.isVerified);
      console.log('🔐 Status:       ' + admin.verificationStatus);
      console.log('🆔 User ID:      ' + admin._id);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Verify password
      const passwordMatch = await bcrypt.compare('password', admin.password);
      console.log('\n🔑 Password test: ' + (passwordMatch ? '✅ CORRECT' : '❌ INCORRECT'));
    }

    console.log('\n📝 Login credentials:');
    console.log('   Email:    admin@fleet.test');
    console.log('   Password: password');
    console.log('   Role:     ADMIN');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

verifyAdmin();
