import { User } from "lib/db/schema";
import { createUser } from "lib/db/users";
import { NextResponse } from "next/server";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newUser: User = {
      name,
      email,
    };

    const createdUser = await createUser(newUser);

    // Create a JWT
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({ userId: createdUser.id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    console.log("Token being set:", token);

    // Set the JWT as an HTTP-only cookie
    const response = NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600, // 1 hour in seconds
      path: "/", // Ensure the cookie is available for all paths
    });

    return response;
  } catch (error) {
    console.error("Error in register route:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Internal Server Error: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
