import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      companyName: string;
      isVerified: boolean;
      verificationStatus?: string;
      verificationComment?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    role: string;
    companyName: string;
    isVerified: boolean;
    verificationStatus?: string;
    verificationComment?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    companyName: string;
    isVerified: boolean;
    verificationStatus?: string;
    verificationComment?: string;
  }
}