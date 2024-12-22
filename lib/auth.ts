import jwt from 'jsonwebtoken';
import { getUserById } from "./db/users";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getUserFromToken(token: string) {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = payload.userId;
    const user = await getUserById(userId);
    return user;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}
