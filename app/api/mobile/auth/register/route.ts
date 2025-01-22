import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/db";
import { UsersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, body.email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user
    const [user] = await db
      .insert(UsersTable)
      .values({
        name: body.name,
        email: body.email,
        password: hashedPassword,
      })
      .returning();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    // Return user data and token
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
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
