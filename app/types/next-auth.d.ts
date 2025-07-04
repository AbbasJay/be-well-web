/* eslint-disable @typescript-eslint/no-unused-vars */
import { DefaultSession, NextAuth } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      googleConnected?: boolean;
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
