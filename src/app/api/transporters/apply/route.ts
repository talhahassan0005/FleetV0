import { NextRequest, NextResponse } from 'next/server';
import { sendTransporterApplicationEmail } from '@/lib/email';

/**
 * @swagger
 * /api/transporters/apply:
 *   post:
 *     summary: Apply as transporter
 *     description: Submit application to join FleetXchange transporter network
 *     tags:
 *       - Transporters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - contactName
 *               - email
 *               - phone
 *               - country
 *               - fleetSize
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: Swift Transport Ltd
 *               contactName:
 *                 type: string
 *                 example: Jane Smith
 *               email:
 *                 type: string
 *                 example: jane@swifttransport.com
 *               phone:
 *                 type: string
 *                 example: +27 73 828 1478
 *               country:
 *                 type: string
 *                 example: South Africa
 *               fleetSize:
 *                 type: number
 *                 example: 15
 *               vehicleTypes:
 *                 type: string
 *                 example: Flatbed, Refrigerated
 *               operatingRegions:
 *                 type: string
 *                 example: South Africa, Botswana, Zimbabwe
 *               yearsInBusiness:
 *                 type: number
 *                 example: 5
 *               message:
 *                 type: string
 *                 example: We are interested in joining your network
 *     responses:
 *       201:
 *         description: Application submitted successfully
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['companyName', 'contactName', 'email', 'phone', 'country', 'fleetSize'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create application
    const application = {
      id: Date.now().toString(),
      ...body,
      status: 'Pending Verification',
      applicationDate: new Date().toISOString()
    };

    // Send email notification to owners
    await sendTransporterApplicationEmail(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully. Our team will review and contact you within 48 hours.',
        data: application
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
