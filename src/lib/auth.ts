import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDatabase } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }
        try {
          const db = await getDatabase();
          const user = await db.collection('users').findOne({
            email: credentials.email.toLowerCase(),
          });
          if (!user) throw new Error('No user found');
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) throw new Error('Invalid password');
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            adminRole: user.adminRole,
            companyName: user.companyName,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            verificationComment: user.verificationComment,
          };
        } catch (err: any) {
          throw new Error(err.message || 'Authorization failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.adminRole = (user as any).adminRole;
        token.companyName = (user as any).companyName;
        token.isVerified = (user as any).isVerified;
        token.verificationStatus = (user as any).verificationStatus;
        token.verificationComment = (user as any).verificationComment;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session.user as any).adminRole = token.adminRole;
        session.user.companyName = token.companyName as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.verificationStatus = token.verificationStatus as string | undefined;
        session.user.verificationComment = token.verificationComment as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
  // Cookie name MUST include __Secure- prefix in production (matches what NextAuth sets with secure:true)
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};