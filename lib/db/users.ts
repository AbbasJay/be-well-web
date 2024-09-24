import { db } from "./db";
import { UsersTable, User } from "./schema";
import { eq } from "drizzle-orm";

export async function createUser(user: User) {
  try {
    const [createdUser] = await db.insert(UsersTable).values(user).returning();
    return createdUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUserById(id: number) {
  try {
    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, id))
      .limit(1);
    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, email))
      .limit(1);
    return user;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
}
