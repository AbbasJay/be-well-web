import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { db } from "@/lib/db/db";
import { UsersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;
    const [existingUser] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, body.email))
      .execute();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [createdUser] = await db
      .insert(UsersTable)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning({
        id: UsersTable.id,
        name: UsersTable.name,
        email: UsersTable.email,
      });

    return NextResponse.json(
      { message: "User registered successfully", user: createdUser },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
