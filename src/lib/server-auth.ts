import { NextRequest } from 'next/server';
import { verifyAccessToken } from './jwt-utils';
import { getDatabase } from './prisma';
import { ObjectId } from 'mongodb';

export async function getAuthUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload) {
      return null;
    }

    // Fetch full user from database
    const db = await getDatabase();
    const user = await db.collection('users').findOne({
      _id: new ObjectId(payload.id)
    });

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      adminRole: user.adminRole,
      companyName: user.companyName,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export function isAdmin(user: any): boolean {
  const adminRoles = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'OPERATIONS_ADMIN', 'POD_MANAGER'];
  return user && adminRoles.includes(user.role);
}
