import NextAuth, { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user by email
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        // Check if user has a password (might be OAuth user)
        if (!user.password) {
          throw new Error("Please sign in with Google");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow sign in if user exists
      const dbUser = await db.user.findUnique({
        where: { email: user.email! },
        select: { role: true },
      });
      return !!dbUser;
    },
    async jwt({ token, user, account }) {
      // When user signs in (first time or subsequent)
      if (user) {
        // For OAuth providers (Google), user data comes from provider
        // For credentials, user data comes from authorize function
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true, collegeId: true, name: true, phone: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.collegeId = dbUser.collegeId;
          token.name = dbUser.name ?? undefined;
          token.phone = dbUser.phone ?? undefined;
        } else {
          // User not found in database (shouldn't happen with Prisma adapter)
          // But handle gracefully
          token.id = user.id;
          token.role = user.role || "PARTICIPANT";
          token.collegeId = user.collegeId || null;
          token.name = user.name ?? undefined;
          token.phone = user.phone ?? undefined;
        }
      }

      // For subsequent token refreshes, ensure we have user data from DB
      if (token.email && !token.id) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, collegeId: true, name: true, phone: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.collegeId = dbUser.collegeId;
          token.name = dbUser.name ?? undefined;
          token.phone = dbUser.phone ?? undefined;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.collegeId = token.collegeId as string | null;
        session.user.name = token.name as string;
        session.user.phone = token.phone as string | null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Helper to get session in server components
export async function auth() {
  return getServerSession(authOptions);
}
