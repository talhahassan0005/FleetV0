import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/loads:
 *   get:
 *     summary: Get all loads
 *     description: Retrieve a list of all freight loads
 *     tags:
 *       - Loads
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
 *                       origin:
 *                         type: string
 *                       destination:
 *                         type: string
 *                       status:
 *                         type: string
 *   post:
 *     summary: Create a new load
 *     description: Create a new freight load request
 *     tags:
 *       - Loads
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - cargoType
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               cargoType:
 *                 type: string
 *               weight:
 *                 type: number
 *     responses:
 *       201:
 *         description: Load created successfully
 */

export async function GET(request: NextRequest) {
  const loads = [
    {
      id: '1',
      origin: 'Johannesburg, South Africa',
      destination: 'Harare, Zimbabwe',
      status: 'In Transit',
      cargoType: 'General Freight',
      weight: 5000
    },
    {
      id: '2',
      origin: 'Gaborone, Botswana',
      destination: 'Lusaka, Zambia',
      status: 'Pending',
      cargoType: 'Electronics',
      weight: 2000
    }
  ];

  return NextResponse.json({ success: true, data: loads });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newLoad = {
    id: Date.now().toString(),
    ...body,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  return NextResponse.json({ success: true, data: newLoad }, { status: 201 });
}
