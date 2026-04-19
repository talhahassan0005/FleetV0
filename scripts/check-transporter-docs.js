// scripts/check-transporter-docs.js
// Run: node scripts/check-transporter-docs.js <transporter-email>

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkTransporterDocs() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Usage: node scripts/check-transporter-docs.js <transporter-email>');
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
    console.log('Role:', transporter.role);
    console.log('isVerified:', transporter.isVerified || false);
    console.log('User ID:', transporter._id.toString());

    // Get all documents for this transporter
    const documents = await db.collection('documents').find({
      userId: transporter._id
    }).toArray();

    console.log('\n📄 ALL DOCUMENTS:', documents.length);
    console.log('─────────────────────────────────────────────────────');

    documents.forEach((doc, index) => {
      console.log(`\n${index + 1}. Document ID: ${doc._id}`);
      console.log(`   Type: "${doc.docType}"`);
      console.log(`   Name: ${doc.originalName}`);
      console.log(`   Status: ${doc.verificationStatus || 'PENDING'}`);
      console.log(`   Uploaded: ${doc.createdAt}`);
    });

    // Get approved documents
    const approvedDocs = await db.collection('documents').find({
      userId: transporter._id,
      verificationStatus: 'APPROVED',
      docType: { $nin: ['POD', 'INVOICE'] }
    }).toArray();

    const approvedDocTypes = approvedDocs.map(d => d.docType);

    console.log('\n✅ APPROVED DOCUMENTS:', approvedDocs.length);
    console.log('─────────────────────────────────────────────────────');
    console.log('Approved Types:', approvedDocTypes);

    // Check required documents
    console.log('\n🔍 VERIFICATION CHECK:');
    console.log('─────────────────────────────────────────────────────');
    
    const required = {
      'COMPANY': approvedDocTypes.includes('COMPANY'),
      'BANK_CONFIRMATION': approvedDocTypes.includes('BANK_CONFIRMATION'),
      'AUTHORIZATION': approvedDocTypes.includes('AUTHORIZATION'),
      'INSURANCE': approvedDocTypes.includes('INSURANCE'),
      'TAX_CLEARANCE': approvedDocTypes.includes('TAX_CLEARANCE'),
      'VEHICLE_LIST': approvedDocTypes.includes('VEHICLE_LIST')
    };

    Object.entries(required).forEach(([docType, hasIt]) => {
      console.log(`${hasIt ? '✅' : '❌'} ${docType}`);
    });

    const allApproved = Object.values(required).every(v => v === true);
    
    console.log('\n📊 RESULT:');
    console.log('─────────────────────────────────────────────────────');
    console.log('All 6 documents approved:', allApproved ? '✅ YES' : '❌ NO');
    console.log('Account should be verified:', allApproved ? '✅ YES' : '❌ NO');
    console.log('Account is actually verified:', transporter.isVerified ? '✅ YES' : '❌ NO');

    if (allApproved && !transporter.isVerified) {
      console.log('\n⚠️  PROBLEM DETECTED:');
      console.log('All documents are approved but account is NOT verified!');
      console.log('This means the auto-verification logic did not run properly.');
    }

    // Show unique document types in database
    const allDocTypes = await db.collection('documents').distinct('docType', {
      userId: transporter._id
    });
    
    console.log('\n📝 ALL DOCUMENT TYPES IN DATABASE:');
    console.log('─────────────────────────────────────────────────────');
    allDocTypes.forEach(type => {
      console.log(`"${type}"`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkTransporterDocs();
