import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/transporters:
 *   get:
 *     summary: Get all transporters
 *     description: Retrieve a list of all registered transporters
 *     tags:
 *       - Transporters
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       country:
 *                         type: string
 *                       fleetSize:
 *                         type: number
 *   post:
 *     summary: Register a new transporter
 *     description: Register a new transporter in the network
 *     tags:
 *       - Transporters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               country:
 *                 type: string
 *               fleetSize:
 *                 type: number
 *     responses:
 *       201:
 *         description: Transporter registered successfully
 */

export async function GET(request: NextRequest) {
  const transporters = [
    {
      id: '1',
      name: 'Swift Logistics',
      country: 'South Africa',
      fleetSize: 25,
      rating: 4.8
    },
    {
      id: '2',
      name: 'Trans Africa Freight',
      country: 'Zimbabwe',
      fleetSize: 15,
      rating: 4.5
    }
  ];

  return NextResponse.json({ success: true, data: transporters });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newTransporter = {
    id: Date.now().toString(),
    ...body,
    status: 'Pending Verification',
    createdAt: new Date().toISOString()
  };

  return NextResponse.json({ success: true, data: newTransporter }, { status: 201 });
}
