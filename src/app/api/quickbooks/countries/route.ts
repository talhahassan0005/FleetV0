import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import { QBCountryConfig } from '@/lib/models';
import { NextResponse } from 'next/server';

const DEFAULT_COUNTRIES = [
  { country: 'ZA', label: 'South Africa', currency: 'ZAR', flag: '🇿🇦', sortOrder: 1 },
  { country: 'BW', label: 'Botswana',     currency: 'BWP', flag: '🇧🇼', sortOrder: 2 },
  { country: 'ZW', label: 'Zimbabwe',     currency: 'ZWL', flag: '🇿🇼', sortOrder: 3 },
  { country: 'ZM', label: 'Zambia',       currency: 'ZMW', flag: '🇿🇲', sortOrder: 4 },
  { country: 'MZ', label: 'Mozambique',   currency: 'MZN', flag: '🇲🇿', sortOrder: 5 },
];

// GET — fetch all active countries
export async function GET() {
  try {
    await connectToDatabase();
    
    // Seed defaults if empty
    const count = await QBCountryConfig.countDocuments();
    if (count === 0) {
      await QBCountryConfig.insertMany(DEFAULT_COUNTRIES);
    }

    const countries = await QBCountryConfig.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();

    return NextResponse.json({ success: true, countries });
  } catch (error) {
    console.error('[QB Countries] Error fetching countries:', error);
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}

// POST — add new country
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { country, label, currency, flag, sortOrder } = await req.json();

    if (!country || !label || !currency || !flag) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await QBCountryConfig.findOne({ country: country.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: 'Country already exists' }, { status: 400 });
    }

    const newCountry = await QBCountryConfig.create({
      country: country.toUpperCase(),
      label,
      currency: currency.toUpperCase(),
      flag,
      sortOrder: sortOrder || 99,
      isActive: true,
    });

    return NextResponse.json({ success: true, country: newCountry });
  } catch (error) {
    console.error('[QB Countries] Error adding country:', error);
    return NextResponse.json({ error: 'Failed to add country' }, { status: 500 });
  }
}

// PATCH — edit existing country
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { country, label, currency, flag, isActive, sortOrder } = await req.json();
    await connectToDatabase();

    const updated = await QBCountryConfig.findOneAndUpdate(
      { country: country.toUpperCase() },
      { $set: { label, currency: currency.toUpperCase(), flag, isActive, sortOrder, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, country: updated });
  } catch (error) {
    console.error('[QB Countries] Error updating country:', error);
    return NextResponse.json({ error: 'Failed to update country' }, { status: 500 });
  }
}

// DELETE — remove country
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { country } = await req.json();
    await connectToDatabase();

    const deleted = await QBCountryConfig.findOneAndDelete({ country: country.toUpperCase() });
    if (!deleted) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[QB Countries] Error deleting country:', error);
    return NextResponse.json({ error: 'Failed to delete country' }, { status: 500 });
  }
}
