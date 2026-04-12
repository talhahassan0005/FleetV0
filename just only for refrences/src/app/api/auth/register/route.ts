// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  email:       z.string().email(),
  password:    z.string().min(6),
  role:        z.enum(['CLIENT', 'TRANSPORTER']),
  companyName: z.string().min(1),
  contactName: z.string().optional(),
  phone:       z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (existing) return NextResponse.json({ error: 'Email already registered.' }, { status: 400 })

    const hashed = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        email:       data.email.toLowerCase(),
        password:    hashed,
        role:        data.role,
        companyName: data.companyName,
        contactName: data.contactName,
        phone:       data.phone,
        isVerified:  false,
      },
    })

    return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors }, { status: 422 })
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
