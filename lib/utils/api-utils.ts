import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth/mobile-auth";

export type AuthResult =
  | {
      user: { id: number; email: string };
    }
  | {
      error: string;
      status: number;
    };

export async function withAuth<T>(
  request: NextRequest,
  handler: (user: { id: number; email: string }) => Promise<T>
): Promise<T | NextResponse> {
  const authResult = await verifyAuth(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }
  return handler(authResult.user);
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}
