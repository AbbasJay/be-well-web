import { DefaultSession } from "next-auth";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
    accessToken?: string;
    error?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    error?: string;
  }
}
