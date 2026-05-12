const { MongoClient } = require('mongodb');

const uri = 'mongodb://adminUser:Admin123@localhost:27017/fleetxchange?authSource=admin';

async function updateAdminRole() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fleetxchange');
    
    // First check current user
    const currentUser = await db.collection('users').findOne({ email: 'admin@fleet.test' });
    console.log('Current user:', currentUser);
    
    // Update role from ADMIN to SUPER_ADMIN
    const result = await db.collection('users').updateOne(
      { email: 'admin@fleet.test' },
      { $set: { role: 'SUPER_ADMIN' } }
    );
    
    console.log('Update result:', result);
    
    // Check updated user
    const updatedUser = await db.collection('users').findOne({ email: 'admin@fleet.test' });
    console.log('Updated user:', updatedUser);
    
  } finally {
    await client.close();
  }
}

updateAdminRole().catch(console.error);
