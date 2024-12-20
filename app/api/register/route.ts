import { NextResponse } from "next/server";
import * as jose from "jose";
import bcrypt from "bcryptjs";
import { User } from "@/lib/db/schema";
import { createUser } from "@/lib/db/users";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      name,
      email,
      password: hashedPassword,
    };

    const createdUser = await createUser(newUser);

    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({ userId: createdUser.id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    console.log("User created:", createdUser);

    const response = NextResponse.json(
      { message: "User registered successfully", token },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error("Error in register route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
