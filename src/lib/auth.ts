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
        console.log('[Auth] Attempting login for:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials')
          throw new Error('Please enter an email and password');
        }

        try {
          const db = await getDatabase();
          
          console.log('[Auth] Querying database for user:', credentials.email.toLowerCase())
          const user = await db.collection('users').findOne({
            email: credentials.email.toLowerCase(),
          })

          if (!user) {
            console.log('[Auth] User not found:', credentials.email)
            throw new Error('No user found');
          }

          console.log('[Auth] User found, comparing password')
          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            console.log('[Auth] Invalid password for user:', credentials.email)
            throw new Error('Invalid password');
          }

          console.log('[Auth] Login successful for:', credentials.email)
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            companyName: user.companyName,
            isVerified: user.isVerified as boolean,
            verificationStatus: user.verificationStatus,
            verificationComment: user.verificationComment,
          };
        } catch (err: any) {
          console.error('[Auth] Authorization error:', err.message)
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
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'very-secure-secret-key-1234',
};