import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db/db";
import { UsersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface JWTPayload {
  id: number;
  email: string;
  name: string;
}

export async function verifyAuth(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return {
        error: "No token provided",
        status: 401,
      };
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as JWTPayload;

    // Verify user still exists
    const [user] = await db
      .select({
        id: UsersTable.id,
        email: UsersTable.email,
        name: UsersTable.name,
      })
      .from(UsersTable)
      .where(eq(UsersTable.id, decoded.id))
      .limit(1);

    if (!user) {
      return {
        error: "User not found",
        status: 401,
      };
    }

    return {
      user,
      status: 200,
    };
  } catch (error) {
    console.error("Auth error:", error);
    return {
      error: "Invalid token",
      status: 401,
    };
  }
}
