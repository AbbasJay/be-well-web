import { jwtVerify } from "jose";
import { getUserById } from "./db/users";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getUserFromToken(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    const userId = payload.userId as number;
    const user = await getUserById(userId);
    return user;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}
