// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('FXadmin2024!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fleetxchange.africa' },
    update: {},
    create: {
      email: 'admin@fleetxchange.africa',
      password: adminPassword,
      role: 'ADMIN',
      companyName: 'FleetXchange',
      contactName: 'Admin',
      isVerified: true,
    },
  })

  console.log('✓ Admin created:', admin.email)
  console.log('  Password: FXadmin2024!')
  console.log('  ⚠  Change this password after first login.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
