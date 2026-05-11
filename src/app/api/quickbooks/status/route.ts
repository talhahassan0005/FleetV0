import { getDatabase } from '@/lib/prisma';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { requirePermission } from '@/lib/rbac';

export async function GET() {
  try {
    const user = await getAuthUser(req)
;
    if (!user?.id || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(user?.role ?? '')) {
      return NextResponse.json({ isConnected: false }, { status: 401 });
    }

    const adminRole = (user as any).adminRole;
    if (!requirePermission(adminRole, 'quickbooks')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(user.id) });
    
    return NextResponse.json({
      isConnected: user?.quickbooks?.isConnected || false,
      realmId: user?.quickbooks?.realmId || null,
      connectedAt: user?.quickbooks?.connectedAt || null,
      tokenExpiresAt: user?.quickbooks?.tokenExpiresAt || null,
      accounts: user?.quickbooksAccounts || [],
    });
  } catch (error) {
    console.error('[QB Status] Error fetching QB status:', error);
    return NextResponse.json({ isConnected: false, error: 'Internal server error' }, { status: 500 });
  }
}
