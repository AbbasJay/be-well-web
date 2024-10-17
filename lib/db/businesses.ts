import { db } from "./db";
import { BusinessesTable, Business } from "./schema";
import { eq } from "drizzle-orm";

export async function getBusinessesByUserId(
  userId: number
): Promise<Business[]> {
  try {
    const businesses = await db
      .select()
      .from(BusinessesTable)
      .where(eq(BusinessesTable.userId, userId));
    return businesses;
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
}

export async function addBusiness(
  businessData: Omit<Business, "id" | "createdAt">
): Promise<Business> {
  try {
    const [insertedBusiness] = await db
      .insert(BusinessesTable)
      .values(businessData)
      .returning();
    return insertedBusiness;
  } catch (error) {
    console.error("Error adding business:", error);
    throw error;
  }
}

export async function getBusinessById(id: number): Promise<Business | null> {
  try {
    const [business] = await db
      .select()
      .from(BusinessesTable)
      .where(eq(BusinessesTable.id, id));
    return business || null;
  } catch (error) {
    console.error("Error fetching business by id:", error);
    throw error;
  }
}

export async function deleteBusiness(id: number): Promise<void> {
  try {
    await db
      .delete(BusinessesTable)
      .where(eq(BusinessesTable.id, id))
      .execute();
  } catch (error) {
    console.error("Error deleting business:", error);
    throw error;
  }
}
