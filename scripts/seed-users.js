const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const testUsers = [
  {
    email: 'client@fleet.test',
    password: 'password',
    role: 'CLIENT',
    companyName: 'Test Client Company',
    contactName: 'Client User',
    phone: '+27123456789',
  },
  {
    email: 'transporter@fleet.test',
    password: 'password',
    role: 'TRANSPORTER',
    companyName: 'Test Transport Company',
    contactName: 'Transporter User',
    phone: '+27987654321',
  },
];

async function seedTestUsers() {
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

    console.log('\n📝 Seeding test users...\n');

    for (const testUser of testUsers) {
      // Check if user already exists
      const existing = await usersCollection.findOne({ 
        email: testUser.email 
      });

      if (existing) {
        console.log(`⚠️  ${testUser.role} user (${testUser.email}) already exists`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(testUser.password, 10);

      // Create user
      const newUser = {
        ...testUser,
        password: hashedPassword,
        isVerified: true,
        verificationStatus: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      console.log(`✅ ${testUser.role} user created: ${testUser.email}`);
      console.log(`   ID: ${result.insertedId}`);
    }

    // Show all users
    console.log('\n📊 Current users in database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const allUsers = await usersCollection.find({}).toArray();
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.role.padEnd(12)} | ${user.email}`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n✨ Total users: ${allUsers.length}`);
    
    console.log('\n🔑 Test credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ADMIN');
    console.log('  Email:    admin@fleet.test');
    console.log('  Password: password');
    console.log('');
    console.log('CLIENT');
    console.log('  Email:    client@fleet.test');
    console.log('  Password: password');
    console.log('');
    console.log('TRANSPORTER');
    console.log('  Email:    transporter@fleet.test');
    console.log('  Password: password');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seedTestUsers();
