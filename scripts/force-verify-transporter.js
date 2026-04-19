// scripts/force-verify-transporter.js
// Run: node scripts/force-verify-transporter.js <transporter-email>

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function forceVerifyTransporter() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Usage: node scripts/force-verify-transporter.js <transporter-email>');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    // Find transporter
    const transporter = await db.collection('users').findOne({
      email: email.toLowerCase(),
      role: 'TRANSPORTER'
    });

    if (!transporter) {
      console.error(`❌ Transporter not found: ${email}`);
      process.exit(1);
    }

    console.log('\n📋 TRANSPORTER INFO:');
    console.log('Name:', transporter.name || transporter.companyName);
    console.log('Email:', transporter.email);
    console.log('Current isVerified:', transporter.isVerified || false);

    // Get approved documents
    const approvedDocs = await db.collection('documents').find({
      userId: transporter._id,
      verificationStatus: 'APPROVED',
      docType: { $nin: ['POD', 'INVOICE'] }
    }).toArray();

    const approvedDocTypes = approvedDocs.map(d => d.docType);

    console.log('\n✅ APPROVED DOCUMENTS:', approvedDocs.length);
    console.log('Types:', approvedDocTypes);

    // Check required documents
    const required = {
      'COMPANY': approvedDocTypes.includes('COMPANY'),
      'BANK_CONFIRMATION': approvedDocTypes.includes('BANK_CONFIRMATION'),
      'AUTHORIZATION': approvedDocTypes.includes('AUTHORIZATION'),
      'INSURANCE': approvedDocTypes.includes('INSURANCE'),
      'TAX_CLEARANCE': approvedDocTypes.includes('TAX_CLEARANCE'),
      'VEHICLE_LIST': approvedDocTypes.includes('VEHICLE_LIST')
    };

    console.log('\n🔍 VERIFICATION CHECK:');
    Object.entries(required).forEach(([docType, hasIt]) => {
      console.log(`${hasIt ? '✅' : '❌'} ${docType}`);
    });

    const allApproved = Object.values(required).every(v => v === true);

    if (!allApproved) {
      console.log('\n❌ Cannot verify: Not all required documents are approved');
      console.log('Missing documents:');
      Object.entries(required).forEach(([docType, hasIt]) => {
        if (!hasIt) console.log(`  - ${docType}`);
      });
      process.exit(1);
    }

    // Force verify
    console.log('\n🔄 Updating transporter account...');
    
    const result = await db.collection('users').updateOne(
      { _id: transporter._id },
      { 
        $set: { 
          isVerified: true, 
          verifiedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ SUCCESS: Transporter account verified!');
      console.log('\nTransporter can now:');
      console.log('  - View available loads');
      console.log('  - Submit quotes');
      console.log('  - Chat with clients');
      console.log('\n⚠️  Note: Transporter needs to logout and login again to see the change.');
    } else {
      console.log('⚠️  No changes made (account may already be verified)');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

forceVerifyTransporter();
