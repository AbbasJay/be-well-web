import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { ClassesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { errorResponse } from "@/lib/utils/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classId = parseInt(params.id);
    if (isNaN(classId)) {
      return errorResponse("Invalid class ID", 400);
    }

    // Get class
    const [classData] = await db
      .select()
      .from(ClassesTable)
      .where(eq(ClassesTable.id, classId))
      .execute();

    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error("Error fetching class:", error);
    return errorResponse("Failed to fetch class");
  }
}
