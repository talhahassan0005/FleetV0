import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { QBCountryConfig } from "@/lib/models";
import { getDatabase } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connectToDatabase = (await import("@/lib/db")).default;
    await connectToDatabase();

    const countries = await QBCountryConfig.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    
    return NextResponse.json({ success: true, countries });
  } catch (error: any) {
    console.error("Error fetching QB countries:", error);
    return NextResponse.json({ error: "Failed to fetch countries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { country, label, currency, flag, sortOrder } = body;

    if (!country || !label || !currency || !flag) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { getDatabase } = await import("@/lib/prisma");
    const connectToDatabase = (await import("@/lib/db")).default;
    await connectToDatabase();

    const newCountry = await QBCountryConfig.create({
      country,
      label,
      currency,
      flag,
      sortOrder: sortOrder || 99,
      isActive: true
    });

    return NextResponse.json({ success: true, country: newCountry });
  } catch (error: any) {
    console.error("Error adding QB country:", error);
    return NextResponse.json({ error: "Failed to add country" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { country } = body;

    if (!country) {
      return NextResponse.json({ error: "Missing country code" }, { status: 400 });
    }

    const connectToDatabase = (await import("@/lib/db")).default;
    await connectToDatabase();

    // Instead of deleting, let's deactivate it or delete it. The client seems to use delete.
    await QBCountryConfig.findOneAndDelete({ country });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting QB country:", error);
    return NextResponse.json({ error: "Failed to delete country" }, { status: 500 });
  }
}
