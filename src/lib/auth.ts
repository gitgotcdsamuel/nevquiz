import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 Auth attempt for:', credentials?.email);
        
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials');
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              studentProfile: true,
              lecturerProfile: true,
              adminProfile: true,
            },
          });

          if (!user) {
            console.log('❌ User not found:', credentials.email);
            return null;
          }

          console.log('✅ User found:', user.email);
          console.log('🔑 User status:', user.status);
          console.log('🔑 Stored hash:', user.password?.substring(0, 30) + '...');

          // Check status (not isActive)
          if (user.status !== 'ACTIVE') {
            console.log('❌ User not active, status:', user.status);
            return null;
          }

          if (!user.password) {
            console.log('❌ User has no password');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('🔑 Password valid?', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Invalid password for:', credentials.email);
            return null;
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          console.log('✅ Login successful for:', user.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Add debug
};