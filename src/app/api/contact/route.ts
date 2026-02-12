import { NextRequest, NextResponse } from 'next/server';
import { sendLoadRequestEmail } from '@/lib/email';

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit load request
 *     description: Submit a new load movement request from contact form
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - contactPerson
 *               - email
 *               - phone
 *               - cargoDetails
 *               - route
 *               - timeline
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: ABC Logistics
 *               contactPerson:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@abclogistics.com
 *               phone:
 *                 type: string
 *                 example: +27 73 828 1478
 *               cargoDetails:
 *                 type: string
 *                 example: 5000kg general freight
 *               route:
 *                 type: string
 *                 example: Johannesburg to Harare
 *               timeline:
 *                 type: string
 *                 example: Pickup on 15 Aug, delivery by 18 Aug
 *               specialRequirements:
 *                 type: string
 *                 example: Temperature controlled
 *     responses:
 *       201:
 *         description: Load request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['companyName', 'contactPerson', 'email', 'phone', 'cargoDetails', 'route', 'timeline'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create load request
    const loadRequest = {
      id: Date.now().toString(),
      ...body,
      status: 'Pending Review',
      createdAt: new Date().toISOString()
    };

    // Send email notification to owners
    await sendLoadRequestEmail(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Load request submitted successfully. We will contact you within 24 hours.',
        data: loadRequest
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to submit load request' },
      { status: 500 }
    );
  }
}
