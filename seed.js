const {MongoClient} = require('mongodb');
const bcrypt = require('bcryptjs');
async function main() {
  const client = await MongoClient.connect('mongodb://adminUser:Admin123@localhost:27017/fleetxchange?authSource=admin');
  const db = client.db('fleetxchange');
  const hash = await bcrypt.hash('Admin@123', 10);
  const result = await db.collection('users').insertOne({
    email: 'admin@fleet.test',
    password: hash,
    name: 'Admin',
    role: 'admin',
    isVerified: true,
    createdAt: new Date()
  });
  console.log('Admin created:', result.insertedId);
  await client.close();
}
main();
