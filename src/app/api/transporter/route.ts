import { NextRequest, NextResponse } from 'next/server';
import { sendTransporterApplicationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['companyName', 'contactName', 'email', 'phone', 'country', 'fleetSize', 'vehicleTypes', 'operatingRoutes', 'yearsInBusiness'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create transporter application
    const application = {
      id: Date.now().toString(),
      ...body,
      status: 'Pending Review',
      createdAt: new Date().toISOString()
    };

    // Send email notification
    await sendTransporterApplicationEmail(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully. We will contact you within 48 hours to begin the vetting process.',
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
