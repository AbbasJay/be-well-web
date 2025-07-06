import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db/db";
import { UsersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const [user] = await db
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.email, credentials.email))
          .limit(1);

        if (!user) {
          throw new Error("User not found");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!passwordMatch) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      // Check for Google Calendar connection
      try {
        const cookieStore = cookies();
        const googleCookie = cookieStore.get(
          `google_calendar_tokens_${session.user.id}`
        );
        session.user.googleConnected = !!googleCookie;
      } catch (e) {
        session.user.googleConnected = false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
