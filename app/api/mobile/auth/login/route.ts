import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { UsersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Find user by email
    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, body.email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(body.password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email.toLowerCase(),
        name: user.name,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    // Return user data and token
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email.toLowerCase(),
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
